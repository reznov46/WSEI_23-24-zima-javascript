const WEATHER_API_KEY = '0fdd7835f81f160c1006d21abf915c21';
const FIVE_MINUTES = 5 * 60 * 1000;
const WEATHER_IMAGE_BASE_URL = 'https://openweathermap.org/img/wn/ID@2x.png';
interface City {
	name: string;
	weather: Weather | null;
	timestamp?: Date;
}
interface Weather {
	description: string;
	temperature: number;
	icon: string;
}

interface IStorageService<T> {
	save(items: T[]): void;
	retrieve(): T[];
}

const addCityButton = document.getElementById('addCity') as HTMLButtonElement;
const citiesList = document.getElementById('citiesList') as HTMLUListElement;

class LocalStorageService<T> implements IStorageService<T> {
	private memoryKey: string;
	constructor(private readonly key: string) {
		this.memoryKey = key;
	}

	retrieve(): T[] {
		const notesString = localStorage.getItem(this.memoryKey);
		if (notesString) {
			// unsafe AF
			return JSON.parse(notesString, this.dateReviewer);
		} else {
			return [];
		}
	}

	save(items: T[]) {
		localStorage.setItem(this.memoryKey, JSON.stringify(items));
	}

	private dateReviewer(key: any, value: any) {
		if (typeof value === 'string') {
			const a = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).(\d{3})Z/.exec(
				value
			);
			if (a) {
				return new Date(a[0]);
			}
		}
		return value;
	}
}

class WeatherApp {
	storage: LocalStorageService<City>;

	weatherService: WeatherService;

	constructor(
		addCityButton: HTMLButtonElement,
		storageService: LocalStorageService<City>,
		weatherService: WeatherService
	) {
		this.storage = storageService;
		this.weatherService = weatherService;
		addCityButton.addEventListener('click', this.handleAddCity.bind(this));
		this.refreshCities();
	}

	private async handleAddCity() {
		const input = <HTMLInputElement>document.getElementById('searchInput');

		if (!input) {
			return;
		}

		const cityName = input.value;
		console.log(cityName);

		await this.addCity({
			name: cityName,
			weather: null,
		});
	}

	async addCity(city: City) {
		const cities = this.storage.retrieve();
		if (cities.find((c) => c.name === city.name)) {
			alert('To miasto jest już na liście.');
			return;
		}

		if (cities.length > 10) {
			alert('Maksymalna liczba miast to 10.');
			return;
		}
		cities.push(city);
		this.storage.save(cities);
		await this.refreshCities();
	}
	async removeCity(cityName: string) {
		let cities = this.storage.retrieve();
		cities = cities.filter((city) => city.name !== cityName);
		this.storage.save(cities);
		await this.refreshCities();
	}

	async refreshCities() {
		const cities = this.storage.retrieve();

		for (const city of cities) {
			if (
				!city.timestamp ||
				new Date(city.timestamp.getTime() + FIVE_MINUTES) < new Date()
			) {
				const weather = await this.weatherService.getWeather(city.name);
				if (weather) {
					city.weather = weather;
					city.timestamp = new Date();
				}
			}
		}

		this.storage.save(cities);
		this.displayCities(cities);
	}

	displayCities(cities: City[]) {
		citiesList.innerHTML = '';
		cities.forEach((city) => {
			const li = document.createElement('li');
			if (!city.weather) {
				return;
			}
			li.innerHTML = `${city.name} - ${
				city.weather
					? `${city.weather.description} - temp: ${city.weather.temperature}C`
					: 'Brak danych'
			}
            ` +`
			<img src='${WEATHER_IMAGE_BASE_URL.replace(
				'ID',
				city.weather.icon
			)}' alt='weather condition' />`;
			const deleteButton = document.createElement('button');
			deleteButton.textContent = 'Usuń';
			deleteButton.onclick = () => {
				this.removeCity(city.name);
			};
			li.appendChild(deleteButton);
			citiesList.appendChild(li);
		});
	}
}

class WeatherService {
	async getWeather(cityName: string): Promise<Weather | null> {
		const url = `https://api.openweathermap.org/data/2.5/weather?appid=${WEATHER_API_KEY}&q=${cityName}&units=metric&lang=pl`;
		try {
			const response = await fetch(url);
			if (response.status === 404) {
				throw new Error('City not found!');
			}
			const data = await response.json();

			console.log(data.weather.length > 0);

			if (!data.weather && data.weather.length < 1) {
				throw new Error('Brak danych pogodowych');
			}
			return {
				temperature: data.main.temp,
				description: data.weather[0].description,
				icon: data.weather[0].icon,
			};
		} catch (error) {
			console.error('Błąd podczas pobierania danych o pogodzie:', error);
			return null;
		}
	}
}

const localStorageService = new LocalStorageService<City>('cities');
const weatherService = new WeatherService();
const weatherApp = new WeatherApp(
	addCityButton,
	localStorageService,
	weatherService
);

setTimeout(weatherApp.refreshCities.bind(weatherApp), FIVE_MINUTES);
