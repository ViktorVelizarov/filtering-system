"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaDoorOpen, FaChartArea } from 'react-icons/fa';
import { BiSolidArea } from 'react-icons/bi';
import { IoIosCalculator } from "react-icons/io";

export default function Page({ params }) {
  const [property, setProperty] = useState(null);

  useEffect(() => {
    if (params.propertyId) {
      fetch(`/api/GetHouseByID?id=${params.propertyId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Network response was not ok');
          }
          return res.json();
        })
        .then(data => setProperty(data))
        .catch(err => console.error('Fetch error:', err));
    }
  }, [params.propertyId]);

  if (!property) return <div>Loading...</div>;

  return (
    <div className="container mx-auto mt-8 px-16">
      <Link legacyBehavior href="/properties">
        <a className="text-blue-500 underline mb-4 block">Back</a>
      </Link>
      <h1 className="text-2xl font-bold">{property.Title}</h1>
      <p className="text-lg">{property.GoogleMapsAddress}</p>
      <div className="border border-gray-300 rounded-lg p-4 mt-4">
        <div className="flex">
          <div className="flex-2/3 mr-4">
            <div className="h-full">
              <img
                className="w-full h-full rounded-lg object-cover"
                src="/image1.png"
                alt="Description of the image"
              />
            </div>
          </div>
          <div className="flex flex-col justify-between flex-1/3">
            <img
              className="w-full h-auto mb-4 rounded-lg object-cover"
              src="/image1.jpg"
              alt="Description of the image"
              style={{ height: 'calc(50% - 8px)' }}
            />
            <img
              className="w-full h-auto rounded-lg object-cover"
              src="/image4.jpg"
              alt="Description of the image"
              style={{ height: 'calc(50% - 8px)' }}
            />
          </div>
        </div>
        <hr className="border-orange-500 border-t-2 my-4" />
        <h1 className="text-2xl font-bold">{property.Title}</h1>
        <p className="text-lg mb-4">{property.GoogleMapsAddress}</p>
        <div className="flex items-center space-x-4 mb-4">
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
        <div className="flex items-center text-xl font-semibold mb-4">
          <div>€{property.Price}</div>
          
          <a href="#" className="text-blue-500 underline ml-4 font-normal text-sm flex items-center">
          <IoIosCalculator />
            what will my monthly costs be?
          </a>
        </div>
        <h2 className="text-xl font-bold mb-2">Description</h2>
        <p>{property.GeneralInfo}</p>
      </div>
    </div>
  );
}
