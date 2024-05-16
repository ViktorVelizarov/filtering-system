import React, { useEffect, useState } from "react";
import { FaDoorOpen } from "react-icons/fa";
import { BiSolidArea } from "react-icons/bi";
import { FaChartArea } from "react-icons/fa6";
import { TbFilterSearch } from "react-icons/tb";
import { CiChat1 } from "react-icons/ci";

function PropertyCard({ property }) {
  return (
    <div className="flex rounded-lg shadow-md bg-white my-4">
      <img src="https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg?cs=srgb&dl=pexels-binyaminmellish-186077.jpg&fm=jpg" alt="Property" className="w-1/4 rounded-l-lg object-cover" style={{ margin: '1.1rem', borderRadius: '0.5rem' }} />
      <div className="flex flex-col justify-between w-3/4 p-4">
        <div>
          <h2 className="font-bold text-lg">{property.Title}</h2>
          <p>€ {property.Price}</p>
          <div className="flex flex-row mt-3">
            <p className="flex flex-row items-center mr-3"><BiSolidArea className="mr-2"/>{property.SurfaceArea} m</p>
            <p className="flex flex-row items-center mr-3"><FaChartArea className="mr-2"/> {property.PlotSurfaceArea} m</p>
            <p className="flex flex-row items-center"><FaDoorOpen className="mr-2"/>{property.Rooms}</p>
          </div>
          <p className="flex flex-row items-center ml-2">{property.GeneralInfo}</p>
          <p className="flex flex-row items-center ml-2">{property.ConstructionType}</p>
        </div>
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
  const [showPopup, setShowPopup] = useState(false);
  const [inputFieldValue, setInputFieldValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [threadCreated, setThreadCreated] = useState(false);
 
  
  useEffect(() => {
    fetch("http://localhost:3000/houses")
      .then((res) => res.json())
      .then((data) => setHouses(data));
  }, []);

  // Toggle popup visibility
  const togglePopup = async () => {
    setShowPopup(!showPopup);
    if (!threadCreated) {
      try {
        const response = await fetch('http://localhost:3000/createThread');
        const data = await response.json();
        console.log("data")
        console.log(data)
        setMessages(data.messages);
        setThreadCreated(true);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

 // Handle submit of the popup form
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // Make a fetch request to the /addMessage endpoint with input field value as URL parameter
    const response = await fetch(`http://localhost:3000/addMessage?content=${encodeURIComponent(inputFieldValue)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    setMessages(data.messages);
  } catch (error) {
    console.error('Error:', error);
  }
};

  // Filter houses based on search query, price range, plot area range, surface area range, and rooms range
  const filteredHouses = houses.filter(house => {
    const addressMatch = house.GoogleMapsAddress.toLowerCase().includes(searchQuery.toLowerCase());
    const priceMatch = (!fromPrice || parseInt(house.Price) >= parseInt(fromPrice)) && (!toPrice || parseInt(house.Price) <= parseInt(toPrice));
    const plotAreaMatch = (!fromPlotArea || parseInt(house.PlotSurfaceArea) >= parseInt(fromPlotArea)) && (!toPlotArea || parseInt(house.PlotSurfaceArea) <= parseInt(toPlotArea));
    const surfaceAreaMatch = (!fromSurfaceArea || parseInt(house.SurfaceArea) >= parseInt(fromSurfaceArea)) && (!toSurfaceArea || parseInt(house.SurfaceArea) <= parseInt(toSurfaceArea));
    const roomsMatch = (!fromRooms || parseInt(house.Rooms) >= parseInt(fromRooms)) && (!toRooms || parseInt(house.Rooms) <= parseInt(toRooms));
    return addressMatch && priceMatch && plotAreaMatch && surfaceAreaMatch && roomsMatch;
  });

  return (
    <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 ml-8 relative">
      {/* Button to toggle popup */}
      <button onClick={togglePopup} className="fixed bottom-8 right-8 bg-blue-500 text-white py-2 px-4 rounded-full flex items-center justify-center z-10">
        <CiChat1 />
      </button>

  {/* Popup */}
{showPopup && (
  <div className="fixed bottom-20 right-8 bg-white p-4 rounded-md shadow-md z-20 w-96">
        {/* Display messages */}
    <div className="max-h-80 overflow-y-auto">
      {messages.slice(0).reverse().map((message, index) => (
        <div key={index} className={`message ${message.startsWith('user') ? 'bg-blue-500 text-white rounded-br-3xl rounded-tl-3xl ml-auto m-2' : 'bg-gray-300 text-black rounded-bl-3xl rounded-tr-3xl mr-auto'}`}>
          <p className="p-2">{message}</p>
        </div>
      ))}
    </div>

    <form onSubmit={handleSubmit}>
      <label htmlFor="propertyInfo"> </label>
      <div className="flex flex-col">
        <input className=" border-black"
          type="text"
          id="propertyInfo"
          name="propertyInfo"
          value={inputFieldValue}
          onChange={(e) => setInputFieldValue(e.target.value)}
        />
        <button className=" mt-3 bg-green-500 rounded-lg" type="submit">Submit</button>
      </div>
    </form>
  </div>
)}



      {/* Filters section */}
      <div className="md:col-span-1">
        <button className="bg-black rounded-md w-60 text-white flex flex-row items-center my-4 px-2 py-1"><TbFilterSearch /> Filters</button>
        {/* Price filters */}
        <p className="font-medium"> Price</p>
        <div className="my-4 flex flex-row items-center">
          <input 
            type="number" 
            placeholder="" 
            value={fromPrice}
            onChange={(e) => setFromPrice(e.target.value)}
            className="px-2 py-1 border border-gray-400 w-1/3 mr-2"
          />
          <p className="ml-2 mr-4"> to </p>
          <input 
            type="number" 
            placeholder="" 
            value={toPrice}
            onChange={(e) => setToPrice(e.target.value)}
            className="px-2 py-1 border border-gray-400 w-1/3"
          />
        </div>
        {/* Plot area filters */}
        <p className="font-medium"> Plot Area</p>
        <div className="my-4 flex flex-row items-center">
          <input 
            type="number" 
            placeholder="" 
            value={fromPlotArea}
            onChange={(e) => setFromPlotArea(e.target.value)}
            className="px-2 py-1 border border-gray-400 w-1/3 mr-2"
          />
          <p className="ml-2 mr-4"> to </p>
          <input 
            type="number" 
            placeholder="" 
            value={toPlotArea}
            onChange={(e) => setToPlotArea(e.target.value)}
            className="px-2 py-1 border border-gray-400 w-1/3"
          />
        </div>
        {/* Surface area filters */}
        <p className="font-medium"> Surface area</p>
        <div className="my-4 flex flex-row items-center">
          <input 
            type="number" 
            placeholder="" 
            value={fromSurfaceArea}
            onChange={(e) => setFromSurfaceArea(e.target.value)}
            className="px-2 py-1 border border-gray-400 w-1/3 mr-2"
          />
          <p className="ml-2 mr-4"> to </p>
          <input 
            type="number" 
            placeholder="" 
            value={toSurfaceArea}
            onChange={(e) => setToSurfaceArea(e.target.value)}
            className="px-2 py-1 border border-gray-400 w-1/3"
          />
        </div>
        {/* Rooms filters */}
        <p className="font-medium"> Rooms</p>
        <div className="my-4 flex flex-row items-center">
          <input 
            type="number" 
            placeholder="" 
            value={fromRooms}
            onChange={(e) => setFromRooms(e.target.value)}
            className="px-2 py-1 border border-gray-400 w-1/3 mr-2"
          />
          <p className="ml-2 mr-4"> to </p>
          <input 
            type="number" 
            placeholder="" 
            value={toRooms}
            onChange={(e) => setToRooms(e.target.value)}
            className="px-2 py-1 border border-gray-400 w-1/3"
          />
        </div>
      </div>

      {/* Search and Property Cards */}
      <div className="md:col-span-3">
        {/* Search bar */}
        <input 
          type="text" 
          placeholder="Search by address..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="my-4 px-2 py-1 border border-gray-400 w-full rounded-md"
        />
        {/* Property Cards */}
        <div className="grid grid-cols-1 gap-4">
          {filteredHouses.map((house) => (
            <PropertyCard key={house.PropertyID} property={house} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
