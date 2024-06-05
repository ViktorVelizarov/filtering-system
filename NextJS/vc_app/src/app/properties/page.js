'use client'

import React, { useState, useEffect } from 'react';
import { FaDoorOpen } from 'react-icons/fa';
import { BiSolidArea } from 'react-icons/bi';
import { FaChartArea } from 'react-icons/fa6';
import { TbFilterSearch } from 'react-icons/tb';
import { CiChat1 } from 'react-icons/ci';

function PropertyCard({ property }) {
  return (
    <div className="rounded-lg shadow-md bg-white my-4">
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
            <FaDoorOpen className="mr-1"/> {property.Rooms}
          </div>
          <div className="flex items-center">
            <BiSolidArea className="mr-1"/>{property.SurfaceArea} m²
          </div>
          <div className="flex items-center">
            <FaChartArea className="mr-1"/> {property.PlotSurfaceArea} m²
          </div>
        </div>
      </div>
      <div className="px-4 pb-4 text-sm">
        <span>{property.GoogleMapsAddress}</span>
      </div>
    </div>
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
  const [showPopup, setShowPopup] = useState(false);
  const [inputFieldValue, setInputFieldValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [threadCreated, setThreadCreated] = useState(false);
  const [streamedMessage, setStreamedMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 6; // Set the number of properties per page
  const [pageWindow, setPageWindow] = useState([1, 5]);

  useEffect(() => {
    fetch("http://localhost:3001/houses")
      .then((res) => res.json())
      .then((data) => setHouses(data));
  }, []);

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:3001/events");
    eventSource.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      setStreamedMessage((prevMessage) => prevMessage + newMessage.content);
    };
    return () => {
      eventSource.close();
    };
  }, []);

  const togglePopup = async () => {
    setShowPopup(!showPopup);
    if (!threadCreated) {
      try {
        console.log("created thread")
        const response = await fetch('http://localhost:3001/createThread');
        const data = await response.json();
        setMessages(data.messages.reverse());
        setThreadCreated(true);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessages(prevMessages => [...prevMessages, `user: ${inputFieldValue}`]);
    try {
      const response = await fetch(`http://localhost:3001/addMessage?content=${encodeURIComponent(inputFieldValue)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setMessages(data.messages.reverse());
      setStreamedMessage('');
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
    setInputFieldValue('');
  };

  const handleLocationChange = (location) => {
    if (selectedLocations.includes(location)) {
      setSelectedLocations(selectedLocations.filter(l => l !== location));
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

  const totalPages = Math.ceil(filteredHouses.length / propertiesPerPage);
  const indexOfLastHouse = currentPage * propertiesPerPage;
  const indexOfFirstHouse = indexOfLastHouse - propertiesPerPage;
  const currentHouses = filteredHouses.slice(indexOfFirstHouse, indexOfLastHouse);

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
      <button onClick={togglePopup} className="fixed bottom-8 right-8 bg-blue-500 text-white py-2 px-4 rounded-full flex items-center justify-center z-10">
        <CiChat1 />
      </button>

      {showPopup && (
        <div className="fixed bottom-20 right-8 bg-white p-4 rounded-md shadow-md z-20 w-96">
          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="message bg-gray-300 text-black rounded-bl-3xl rounded-tr-3xl mr-auto">
                <p className="p-2">{streamedMessage}</p>
              </div>
            )}
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.startsWith('user') ? 'bg-blue-500 text-white rounded-br-3xl rounded-tl-3xl ml-auto m-2' : 'bg-gray-300 text-black rounded-bl-3xl rounded-tr-3xl mr-auto'}`}>
                <p className="p-2">{message}</p>
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit}>
            <label htmlFor="propertyInfo"> </label>
            <div className="flex flex-col">
              <input className="border-black"
                type="text"
                id="propertyInfo"
                name="propertyInfo"
                value={inputFieldValue}
                onChange={(e) => setInputFieldValue(e.target.value)}              />
                <button className="mt-3 bg-green-500 rounded-lg" type="submit">Submit</button>
              </div>
            </form>
          </div>
        )}
  
        <div className="md:col-span-1">
          <button className="bg-black rounded-md w-full text-white flex flex-row items-center my-4 px-2 py-1"><TbFilterSearch /> Filters</button>
          <p className="font-medium"> Price</p>
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
                className="px-1 h-7 py-1 border  w-20 border-black rounded-md ml-3"
              />
            </div>
            <hr className="pb-3 " />
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
            <hr className="pb-3 " />
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
            <hr className="pb-3 " />
            <p className="font-medium"> Plot area</p>
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
            <hr className="pb-3 " />
            <p className="font-medium"> Surface area</p>
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
            <hr className="pb-3 " />
            <p className="font-medium"> Rooms</p>
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
            <hr className="pb-3 " />
          
          </div>
        </div>
  
        <div className="md:col-span-3">
          <div className="flex items-center my-4">
            <input
              type="text"
              placeholder="Search by address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-2 py-2 border border-gray-400 w-4/5 rounded-l-md"
            />
            <button className="bg-blue-500 text-white px-2 py-2 rounded-r-md w-1/5">Search</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentHouses.map((house) => (
              <PropertyCard key={house.PropertyID} property={house} />
            ))}
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
  
