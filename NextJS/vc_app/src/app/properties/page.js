"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaDoorOpen, FaChartArea } from 'react-icons/fa';
import { BiSolidArea } from 'react-icons/bi';
import { TbFilterSearch } from 'react-icons/tb';
import { CiChat1 } from 'react-icons/ci';

function PropertyCard({ property }) {
  return (
    <Link href={`/${property.PropertyID}`} passHref>
      <div className="rounded-lg shadow-md bg-white my-4 cursor-pointer">
        <img
          src="https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg?cs=srgb&dl=pexels-binyaminmellish-186077.jpg&fm=jpg"
          alt="Property"
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="flex justify-between p-4 text-sm">
          <div className="flex flex-col">
            <span>Bidding from</span>
            <span className="font-bold text-lg">€ {property.Price}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <FaDoorOpen className="mr-1" /> {property.Rooms}
            </div>
            <div className="flex items-center">
              <BiSolidArea className="mr-1" /> {property.SurfaceArea} m²
            </div>
            <div className="flex items-center">
              <FaChartArea className="mr-1" /> {property.PlotSurfaceArea} m²
            </div>
          </div>
        </div>
        <div className="px-4 pb-4 text-sm">
          <span>{property.GoogleMapsAddress}</span>
        </div>
      </div>
    </Link>
  );
}

function App() {
  const [houses, setHouses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [fromPrice, setFromPrice] = useState('');
  const [toPrice, setToPrice] = useState('');
  const [fromPlotArea, setFromPlotArea] = useState('');
  const [toPlotArea, setToPlotArea] = useState('');
  const [fromSurfaceArea, setFromSurfaceArea] = useState('');
  const [toSurfaceArea, setToSurfaceArea] = useState('');
  const [fromRooms, setFromRooms] = useState('');
  const [toRooms, setToRooms] = useState('');
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedConstructionTypes, setSelectedConstructionTypes] = useState([]);
  const [showFilters, setShowFilters] = useState(true); // Toggle between filters and chat
  const [inputFieldValue, setInputFieldValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [threadCreated, setThreadCreated] = useState(false);
  const [streamedMessage, setStreamedMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendedProperties, setRecommendedProperties] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 9;
  const [pageWindow, setPageWindow] = useState([1, 5]);

  console.log("recommendedProperties")
console.log(recommendedProperties)
  
  useEffect(() => {
    fetch("/api/GetHouses")
      .then((res) => res.json())
      .then((data) => setHouses(data));
  }, []);

 
  useEffect(() => {
    const propertyTitlesRegex = /Property Title: (.*?)(?:,|$)/g;
    let matchedTitles = [];
  
    messages.forEach(message => {
      const matches = message.matchAll(propertyTitlesRegex);
      for (const match of matches) {
        const title = match[1].trim();
        if (!matchedTitles.includes(title)) {
          matchedTitles.push(title);
        }
      }
    });
  
    setRecommendedProperties(matchedTitles);
  }, [messages]);
  

  const toggleSection = () => {
    setShowFilters(!showFilters);
  };

  const toggleChatPopup = () => {
    setShowFilters(false); // Hide filters when chat is opened
    if(!threadCreated){
      createChatThread();
      setLoading(true);
    }
    
  };

  const createChatThread = async () => {
    try {
      console.log("Creating thread...");
      const response = await fetch('/api/CreateThread');
      const data = await response.json();
      setMessages(data.messages.reverse());
      setThreadCreated(true);
      setLoading(false);
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessages(prevMessages => [...prevMessages, `user: ${inputFieldValue}`]);

    try {
      const response = await fetch(`/api/AddMessage?content=${encodeURIComponent(inputFieldValue)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      const data = await response.json();
      setMessages(data.messages.reverse());
      setStreamedMessage('');
    } catch (error) {
      console.error('Error adding message:', error);
    }

    setLoading(false);
    setInputFieldValue('');
  };

  const handleLocationChange = (location) => {
    if (selectedLocations.includes(location)) {
      setSelectedLocations(selectedLocations.filter(loc => loc !== location));
    } else {
      setSelectedLocations([...selectedLocations, location]);
    }
  };

  const handleConstructionTypeChange = (constructionType) => {
    if (selectedConstructionTypes.includes(constructionType)) {
      setSelectedConstructionTypes(selectedConstructionTypes.filter(type => type !== constructionType));
    } else {
      setSelectedConstructionTypes([...selectedConstructionTypes, constructionType]);
    }
  };

  const filteredHouses = houses.filter(house => {
    const addressMatch = house.GoogleMapsAddress.toLowerCase().includes(searchQuery.toLowerCase());
    const priceMatch = (!fromPrice || parseInt(house.Price) >= parseInt(fromPrice)) && (!toPrice || parseInt(house.Price) <= parseInt(toPrice));
    const plotAreaMatch = (!fromPlotArea || parseInt(house.PlotSurfaceArea) >= parseInt(fromPlotArea)) && (!toPlotArea || parseInt(house.PlotSurfaceArea) <= parseInt(toPlotArea));
    const surfaceAreaMatch = (!fromSurfaceArea || parseInt(house.SurfaceArea) >= parseInt(fromSurfaceArea)) && (!toSurfaceArea || parseInt(house.SurfaceArea) <= parseInt(toSurfaceArea));
    const roomsMatch = (!fromRooms || parseInt(house.Rooms) >= parseInt(fromRooms)) && (!toRooms || parseInt(house.Rooms) <= parseInt(toRooms));
    const locationMatch = selectedLocations.length === 0 || selectedLocations.some(loc => house.GoogleMapsAddress.includes(loc));
    const constructionTypeMatch = selectedConstructionTypes.length === 0 || selectedConstructionTypes.includes(house.ConstructionType);
    return addressMatch && priceMatch && plotAreaMatch && surfaceAreaMatch && roomsMatch && locationMatch && constructionTypeMatch;
  });

  let currentHouses;
  if (recommendedProperties.length === 0) {
    currentHouses = filteredHouses;
  } else {
    currentHouses = filteredHouses.filter(house => {
      const houseTitle = house.Title.split(",")[0].trim();
      return recommendedProperties.includes(houseTitle);
    });
  }

  const totalPages = Math.ceil(filteredHouses.length / propertiesPerPage);
  const indexOfLastHouse = currentPage * propertiesPerPage;
  const indexOfFirstHouse = indexOfLastHouse - propertiesPerPage;
  const paginatedHouses = currentHouses.slice(indexOfFirstHouse, indexOfLastHouse);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);

    const windowSize = 5;
    let newPageWindow;
    if (pageNumber <= Math.ceil(windowSize / 2)) {
      newPageWindow = [1, windowSize];
    } else if (pageNumber + Math.floor(windowSize / 2) >= totalPages) {
      newPageWindow = [totalPages - windowSize + 1, totalPages];
    } else {
      newPageWindow = [pageNumber - Math.floor(windowSize / 2), pageNumber + Math.floor(windowSize / 2)];
    }
    setPageWindow(newPageWindow);
  };

  return (
    <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 relative px-16">
      <div className="md:col-span-1">
        {/* Toggle Buttons */}
        <div className="sticky top-0 bg-white p-4 rounded-md shadow-md flex space-x-4">
          <button onClick={toggleSection} className="bg-black rounded-md w-full text-white flex flex-row items-center justify-center my-2 px-2 py-1">
            <TbFilterSearch className="mr-2" /> Filters
          </button>
          <button onClick={toggleChatPopup} className="bg-blue-500 text-white  rounded-md flex flex-row items-center justify-center w-full my-2 px-2 py-1 ">
            <CiChat1 className="mr-2" /> Chat
          </button>
        </div>

        {/* Filter Section */}
        <div className={`bg-white p-4 rounded-md shadow-md ${showFilters ? 'block' : 'hidden'}`}>
          <h2 className="text-lg font-bold mb-2">Search</h2>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by address"
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
          />

          {/* Price Range */}
          <div className="mb-4">
            <p className="font-medium">Price</p>
            <div className="my-4 flex flex-col space-y-2">
              <div className="flex flex-row items-center pb-3">
                <input
                  type="number"
                  placeholder=""
                  value={fromPrice}
                  onChange={(e) => setFromPrice(e.target.value)}
                  className="px-1 h-7 py-1 border border-black rounded-md w-20 mr-3"
                />
                <p className="mx-2">to</p>
                <input
                  type="number"
                  placeholder=""
                  value={toPrice}
                  onChange={(e) => setToPrice(e.target.value)}
                  className="px-1 h-7 py-1 border w-20 border-black rounded-md ml-3"
                />
              </div>
              <hr className="pb-3" />
            </div>
          </div>

          {/* Location */}
          <div className="mb-4">
            <p className="font-medium">Location</p>
            <div className="grid grid-cols-2 gap-4 pb-3">
              {[
                'Utrecht', 'Leiden', 'Den Bosch', 'Breda', 'Rotterdam',
                'Zwolle', 'Veenendaal', 'Apeldoorn', 'Eindhoven', 'Helmond',
                'Tilburg', 'Drachten', 'Den Haag', 'Valkenburg', 'Haarlem',
                'Amsterdam'
              ].map(location => (
                <label key={location} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedLocations.includes(location)}
                    onChange={() => handleLocationChange(location)}
                    className="form-checkbox h-5 w-5 text-blue-500"
                  />
                  <span className="text-sm font-normal">{location}</span>
                </label>
              ))}
            </div>
            <hr className="pb-3" />
          </div>

          {/* Construction Type */}
          <div className="mb-4">
            <p className="font-medium">Construction Type</p>
            <div className="flex flex-col space-y-1 pb-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedConstructionTypes.includes('Villa')}
                  onChange={() => handleConstructionTypeChange('Villa')}
                  className="form-checkbox h-5 w-5 text-blue-500"
                />
                <span className="text-sm font-normal">Villa</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedConstructionTypes.includes('Tussenwoning')}
                  onChange={() => handleConstructionTypeChange('Tussenwoning')}
                  className="form-checkbox h-5 w-5 text-blue-500"
                />
                <span className="text-sm font-normal">Tussenwoning</span>
              </label>
            </div>
            <hr className="pb-3" />
          </div>

          {/* Plot Area */}
          <div className="mb-4">
            <p className="font-medium">Plot area</p>
            <div className="flex flex-row items-center pb-3">
              <input
                type="number"
                placeholder=""
                value={fromPlotArea}
                onChange={(e) => setFromPlotArea(e.target.value)}
                className="px-1 h-7 py-1 border border-black rounded-md w-20 mr-3"
              />
              <p className="mx-2">to</p>
              <input
                type="number"
                placeholder=""
                value={toPlotArea}
                onChange={(e) => setToPlotArea(e.target.value)}
                className="px-1 h-7 py-1 border border-black rounded-md w-20 ml-3"
              />
            </div>
            <hr className="pb-3" />
          </div>

          {/* Surface Area */}
          <div className="mb-4">
            <p className="font-medium">Surface area</p>
            <div className="flex flex-row items-center pb-3 ">
              <input
                type="number"
                placeholder=""
                value={fromSurfaceArea}
                onChange={(e) => setFromSurfaceArea(e.target.value)}
                className="px-1 h-7 py-1 border border-black rounded-md w-20 mr-3"
              />
              <p className="mx-2">to</p>
              <input
                type="number"
                placeholder=""
                value={toSurfaceArea}
                onChange={(e) => setToSurfaceArea(e.target.value)}
                className="px-1 h-7 py-1 border border-black rounded-md w-20 ml-3"
              />
            </div>
            <hr className="pb-3" />
          </div>

          {/* Rooms */}
          <div className="mb-4">
            <p className="font-medium">Rooms</p>
            <div className="flex flex-row items-center pb-3">
              <input
                type="number"
                placeholder=""
                value={fromRooms}
                onChange={(e) => setFromRooms(e.target.value)}
                className="px-1 h-7 py-1 border border-black rounded-md w-20 mr-3"
              />
              <p className="mx-2">to</p>
              <input
                type="number"
                placeholder=""
                value={toRooms}
                onChange={(e) => setToRooms(e.target.value)}
                className="px-1 h-7 py-1 border border-black rounded-md w-20 ml-3"
              />
            </div>
            <hr className="pb-3" />
          </div>
        </div>

       {/* Chat Section */}
<div className={`bg-white p-4 rounded-md shadow-md ${!showFilters ? 'block' : 'hidden'}`} style={{ maxHeight: '915px', overflowY: 'auto' }}>
  <div className="flex flex-col h-full">
    <div className="flex-1 overflow-y-auto mb-4">
      {messages.map((message, index) => (
        <div key={index} className={`message ${message.startsWith('user') ? 'bg-blue-500 text-white rounded-br-3xl rounded-tl-3xl ml-auto m-2' : 'bg-gray-300 text-black rounded-bl-3xl rounded-tr-3xl mr-auto'}`}>
          <p className="p-2">{message}</p>
        </div>
      ))}
      {loading && (
        <div className="flex justify-center text-gray-400 my-2">
          <div className="bg-gray-200 rounded-lg px-3 py-2 max-w-md break-all rounded-br-3xl rounded-tl-3xl">
            <span>Loading...</span>
          </div>
        </div>
      )}
      {streamedMessage && (
        <div className="flex justify-center text-gray-400 my-2">
          <div className="bg-gray-200 rounded-lg px-3 py-2 max-w-md break-all rounded-br-3xl rounded-tl-3xl">
            <span>{streamedMessage}</span>
          </div>
        </div>
      )}
    </div>
    <form onSubmit={handleSubmit}>
      <div className="flex items-center">
        <input
          type="text"
          value={inputFieldValue}
          onChange={(e) => setInputFieldValue(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 mr-2"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white rounded-full py-2 px-4 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Send
        </button>
      </div>
    </form>
  </div>
</div>

      </div>

      {/* Property Listings */}
      <div className="md:col-span-3 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {paginatedHouses.map((house) => (
            <PropertyCard key={house.PropertyID} property={house} />
          ))}
          {paginatedHouses.length === 0 && <p className="text-center">No properties match the recommended titles.</p>}
        </div>
        <div className="flex justify-center mt-8 pb-11">
          {pageWindow[0] > 1 && (
            <>
              <button onClick={() => paginate(1)} className="px-3 py-1 mx-1 bg-gray-200 text-black rounded-lg">1</button>
              {pageWindow[0] > 2 && <span className="px-3 py-1 mx-1 bg-gray-200 text-black rounded-lg">...</span>}
            </>
          )}
          {Array.from({ length: pageWindow[1] - pageWindow[0] + 1 }, (_, i) => (
            <button
              key={pageWindow[0] + i}
              onClick={() => paginate(pageWindow[0] + i)}
              className={`px-3 py-1 mx-1 ${currentPage === pageWindow[0] + i ? 'bg-blue-500 text-white rounded-lg' : 'bg-gray-200 text-black rounded-lg'}`}
            >
              {pageWindow[0] + i}
            </button>
          ))}
          {pageWindow[1] < totalPages && (
            <>
              {pageWindow[1] < totalPages - 1 && <span className="px-3 py-1 mx-1 bg-gray-200 text-black rounded-lg">...</span>}
              <button onClick={() => paginate(totalPages)} className="px-3 py-1 mx-1 bg-gray-200 text-black rounded-lg">{totalPages}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
