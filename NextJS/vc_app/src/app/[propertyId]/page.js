"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

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
      {/* Add other property details here */}
    </div>
  );
}
