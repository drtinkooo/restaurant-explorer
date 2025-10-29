
import React, { useState, useEffect, useCallback } from 'react';
import { fetchRestaurantInfo } from './services/geminiService';
import type { LatLng, RestaurantInfo } from './types';
import Loader from './components/Loader';
import ErrorAlert from './components/ErrorAlert';
import MarkdownRenderer from './components/MarkdownRenderer';
import { SearchIcon, MapPinIcon, LinkIcon } from './components/IconComponents';

const App: React.FC = () => {
  const [query, setQuery] = useState<string>('Good Italian restaurants nearby');
  const [location, setLocation] = useState<LatLng | null>(null);
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setError(null);
        setIsLoading(false);
      },
      (geoError) => {
        setError(`Geolocation error: ${geoError.message}. Please enable location services.`);
        setIsLoading(false);
      }
    );
  }, []);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      setError('Please enter a search query.');
      return;
    }
    if (!location) {
      setError('Location not available. Please enable location services and refresh the page.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRestaurantInfo(null);

    try {
      const result = await fetchRestaurantInfo(query, location);
      setRestaurantInfo(result);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [query, location]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <div 
        className="relative min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 bg-cover bg-center" 
        style={{backgroundImage: 'linear-gradient(rgba(17, 24, 39, 0.9), rgba(17, 24, 39, 1)), url(https://picsum.photos/1600/900?blur=5&grayscale)'}}
      >
        <header className="w-full max-w-4xl text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Restaurant <span className="text-indigo-400">AI Explorer</span>
          </h1>
          <p className="mt-4 text-lg text-gray-300">
            Discover restaurants with detailed insights powered by Gemini and Google Maps.
          </p>
        </header>

        <main className="w-full max-w-4xl flex-grow">
          <div className="sticky top-4 z-10 bg-gray-900/50 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., 'Best tacos in downtown'"
                className="flex-grow bg-gray-800 border border-gray-600 text-white placeholder-gray-400 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-200"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                disabled={isLoading || !location}
              />
              <button
                onClick={handleSearch}
                disabled={isLoading || !location}
                className="flex justify-center items-center bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed transition duration-200 shadow-lg"
              >
                <SearchIcon />
                <span className="ml-2">{isLoading ? 'Searching...' : 'Search'}</span>
              </button>
            </div>
             {!location && !isLoading && (
                <div className="text-center text-yellow-400 mt-3 text-sm">
                    Waiting for location services. Please grant permission if prompted.
                </div>
            )}
          </div>

          <div className="mt-8">
            {isLoading && <Loader />}
            {error && <ErrorAlert message={error} />}
            {restaurantInfo && (
              <div className="bg-gray-800/60 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700 overflow-hidden transition-all duration-500 animate-fade-in">
                <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold mb-4 text-indigo-300">AI Generated Insights</h2>
                    <MarkdownRenderer content={restaurantInfo.text} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center text-indigo-300">
                        <MapPinIcon/>
                        Data Sources
                    </h3>
                    {restaurantInfo.sources && restaurantInfo.sources.length > 0 ? (
                      <ul className="space-y-3">
                        {restaurantInfo.sources.map((source, index) => (
                          <li key={index}>
                            <a
                              href={source.maps?.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition duration-200"
                            >
                                <LinkIcon/>
                              <span className="text-indigo-300 group-hover:text-indigo-200 underline truncate">
                                {source.maps?.title || 'Google Maps Source'}
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-400">No sources provided for this result.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        <footer className="w-full max-w-4xl text-center mt-8 py-4">
            <p className="text-gray-500 text-sm">Powered by Google Gemini</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
