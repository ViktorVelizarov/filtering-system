"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaDoorOpen, FaChartArea, FaArrowCircleLeft } from "react-icons/fa";
import { BiSolidArea } from "react-icons/bi";
import { IoIosCalculator } from "react-icons/io";

export default function Page({ params }) {
  const [property, setProperty] = useState(null);
  const [showCarousel, setShowCarousel] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAIImage, setShowAIImage] = useState(false);

  useEffect(() => {
    if (params.propertyId) {
      fetch(`/api/GetHouseByID?id=${params.propertyId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Network response was not ok");
          }
          return res.json();
        })
        .then((data) => setProperty(data))
        .catch((err) => console.error("Fetch error:", err));
    }
  }, [params.propertyId]);

  if (!property) return <div>Loading...</div>;

  const images = [
    { normal: "/image1.jpg", ai: "/image1.png" },
    { normal: "/image4.jpg", ai: "/image2.jpg" },
  ];

  const toggleCarousel = (index) => {
    setCurrentImageIndex(index);
    setShowCarousel(true);
  };

  const closeCarousel = () => {
    setShowCarousel(false);
  };

  const nextSlide = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const toggleImage = () => {
    setShowAIImage((prevShowAIImage) => !prevShowAIImage);
  };

  return (
    <div className="container mx-auto mt-8 px-16">
      <Link legacyBehavior href="/properties">
        <a className="text-lg font-bold mb-4 flex items-center gap-2">
          <FaArrowCircleLeft />
          Back
        </a>
      </Link>
      <h1 className="text-2xl font-bold">{property.Title}</h1>
      <p className="text-lg">{property.GoogleMapsAddress}</p>
      <div className="border border-gray-300 rounded-lg p-4 mt-4">
        <div className="flex">
          <div className="flex-2/3 mr-4">
            <div className="h-full relative">
              <img
                className="w-full h-full rounded-lg object-cover cursor-pointer"
                src="/image1.png"
                alt="Description of the image"
                onClick={() => toggleCarousel(0)}
              />
            </div>
          </div>
          <div className="flex flex-col justify-between flex-1/3">
            <img
              className="w-full h-auto mb-4 rounded-lg object-cover cursor-pointer"
              src="/image1.jpg"
              alt="Description of the image"
              style={{ height: "calc(50% - 8px)" }}
              onClick={() => toggleCarousel(1)}
            />
            <img
              className="w-full h-auto rounded-lg object-cover cursor-pointer"
              src="/image4.jpg"
              alt="Description of the image"
              style={{ height: "calc(50% - 8px)" }}
              onClick={() => toggleCarousel(2)}
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
          <a
            href="#"
            className="text-blue-500 underline ml-4 font-normal text-sm flex items-center"
          >
            <IoIosCalculator />
            what will my monthly costs be?
          </a>
        </div>
        <h2 className="text-xl font-bold mb-2">Description</h2>
        <p>{property.GeneralInfo}</p>
      </div>

      {showCarousel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={closeCarousel}
        >
          <div
            className="relative w-11/12 max-w-4xl bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <div
                className="carousel-container flex transition-transform duration-500"
                style={{
                  transform: `translateX(-${currentImageIndex * 100}%)`,
                }}
              >
                {images.map((image, index) => (
                  <div className="carousel-item min-w-full" key={index}>
                    <img
                      className="w-full h-auto rounded-lg"
                      src={showAIImage ? image.ai : image.normal}
                      alt={`Image ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
              <button
                className="absolute top-2 left-2 bg-blue-500 text-white px-4 py-2 rounded-lg z-10"
                onClick={toggleImage}
              >
                AI Pictures
              </button>
              <button
                className="carousel-button prev absolute top-1/2 left-0 transform -translate-y-1/2 bg-gray-800 text-white p-2"
                onClick={prevSlide}
              >
                &#10094;
              </button>
              <button
                className="carousel-button next absolute top-1/2 right-0 transform -translate-y-1/2 bg-gray-800 text-white p-2"
                onClick={nextSlide}
              >
                &#10095;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
