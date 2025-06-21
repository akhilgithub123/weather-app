document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('weatherForm');
  const input = document.getElementById('cityInput');
  const output = document.getElementById('weatherResult');
  const locationBtn = document.getElementById('currentLocationBtn');
  const dropdown = document.getElementById('cityDropdown');
  const dropdownWrapper = document.getElementById('recentCities');

  const API_KEY = 'c8a2804ba30542762c76f8ec2f503c3b';

  function saveRecentCity(city) {
    let cities = JSON.parse(localStorage.getItem('recentCities')) || [];
    cities = cities.filter(c => c.toLowerCase() !== city.toLowerCase()); // Avoid duplicates
    cities.unshift(city);
    if (cities.length > 5) cities = cities.slice(0, 5);
    localStorage.setItem('recentCities', JSON.stringify(cities));
    updateDropdown();
  }

  function updateDropdown() {
    const cities = JSON.parse(localStorage.getItem('recentCities')) || [];
    dropdown.innerHTML = '';
    if (cities.length === 0) {
      dropdownWrapper.classList.add('hidden');
      return;
    }
    cities.forEach(city => {
      const option = document.createElement('option');
      option.value = city;
      option.textContent = city;
      dropdown.appendChild(option);
    });
    dropdownWrapper.classList.remove('hidden');
  }

  async function fetchWeather(city) {
    output.textContent = 'Loading...';
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
      const data = await res.json();
      if (data.cod !== 200) {
        output.textContent = 'City not found.';
        return;
      }
      output.innerHTML = `
        <h2 class="text-xl font-semibold">${data.name}, ${data.sys.country}</h2>
        <p class="text-lg">🌡️ ${data.main.temp}°C</p>
        <p class="capitalize">${data.weather[0].description}</p>
        <p>💨 Wind: ${data.wind.speed} m/s</p>
        <p>🌇 Humidity: ${data.main.humidity}%</p>
      `;
      saveRecentCity(data.name);
    } catch (err) {
      output.textContent = 'Error fetching weather.';
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = input.value.trim();
    if (!city) return;
    fetchWeather(city);
  });

  locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
      output.textContent = 'Getting location...';
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
          const data = await res.json();
          if (data.cod === 200) {
            output.innerHTML = `
              <h2 class="text-xl font-semibold">${data.name}, ${data.sys.country}</h2>
              <p class="text-lg">🌡️ ${data.main.temp}°C</p>
              <p class="capitalize">${data.weather[0].description}</p>
              <p>💨 Wind: ${data.wind.speed} m/s</p>
              <p>🌇 Humidity: ${data.main.humidity}%</p>
            `;
            saveRecentCity(data.name);
          }
        } catch {
          output.textContent = 'Location weather fetch failed.';
        }
      }, () => {
        output.textContent = 'Permission denied for location.';
      });
    } else {
      output.textContent = 'Geolocation not supported.';
    }
  });

  dropdown.addEventListener('change', () => {
    const city = dropdown.value;
    if (city) fetchWeather(city);
  });

  // Init
  updateDropdown();
});
