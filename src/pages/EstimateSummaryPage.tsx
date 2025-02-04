import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download, Mail, Phone } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Layout from '../components/Layout';

interface Room {
  id?: string;
  name: string;
  area: number;
  rate: number;
  amount: number;
  carpetArea?: string;
}

interface Floor {
  id: string;
  name: string;
  carpetArea: string;
  rooms: Room[];
}

interface LocationState {
  layoutType?: string;
  isCustom: boolean;
  isVilla: boolean;
  category: string;
  areaOption?: 'total' | 'rooms';
  totalCarpetArea?: string;
  rooms?: Array<{ id: string; name: string; carpetArea: string }>;
  floors?: Floor[];
  clientName: string;
  projectName: string;
}

interface RoomItem {
  description: string;
  quantity: number;
  unit: string;
  amount: number;
}

interface DetailedRoom extends Room {
  items: RoomItem[];
}

interface DesignCharges {
  description: string;
  amount: number;
}

interface DetailedEstimate {
  rooms: DetailedRoom[];
  totalArea: number;
  designCharges: DesignCharges[];
  subtotal: number;
  gst: number;
  grandTotal: number;
  category: string;
  date: string;
  clientName: string;
  projectName: string;
}

const PRICE_RANGES = {
  standard: 1750,
  premium: 2430,
  luxury: 3560
} as const;

const ROOM_ITEMS: Record<string, RoomItem[]> = {
  'Living Room': [
    { description: 'TV Unit with Storage', quantity: 1, unit: 'Unit', amount: 0.35 },
    { description: 'False Ceiling with LED Lights', quantity: 1, unit: 'Lot', amount: 0.25 },
    { description: 'Wall Paneling', quantity: 1, unit: 'Sq.ft', amount: 0.15 },
    { description: 'Civil Work (wiring, plumbing, etc.)', quantity: 1, unit: 'Lot', amount: 0.10 },
    { description: 'Coffee Table', quantity: 1, unit: 'Unit', amount: 0.08 },
    { description: 'Shoe Cabinet', quantity: 1, unit: 'Unit', amount: 0.05 }
  ],
  'Master Bedroom': [
    { description: 'Wardrobe with Sliding Doors', quantity: 1, unit: 'Unit', amount: 0.30 },
    { description: 'Bed with Storage', quantity: 1, unit: 'Unit', amount: 0.25 },
    { description: 'Side Tables', quantity: 2, unit: 'Units', amount: 0.12 },
    { description: 'Study Table', quantity: 1, unit: 'Unit', amount: 0.13 },
    { description: 'False Ceiling', quantity: 1, unit: 'Lot', amount: 0.10 },
    { description: 'Civil Work (wiring, plumbing, etc.)', quantity: 1, unit: 'Lot', amount: 0.10 }
  ],
  'Bedroom 2': [
    { description: 'Wardrobe with Sliding Doors', quantity: 1, unit: 'Unit', amount: 0.35 },
    { description: 'Bed with Storage', quantity: 1, unit: 'Unit', amount: 0.25 },
    { description: 'Side Tables', quantity: 2, unit: 'Units', amount: 0.15 },
    { description: 'False Ceiling', quantity: 1, unit: 'Lot', amount: 0.15 },
    { description: 'Civil Work (wiring, plumbing, etc.)', quantity: 1, unit: 'Lot', amount: 0.10 }
  ],
  'Bedroom 3': [
    { description: 'Wardrobe with Sliding Doors', quantity: 1, unit: 'Unit', amount: 0.35 },
    { description: 'Bed with Storage', quantity: 1, unit: 'Unit', amount: 0.25 },
    { description: 'Side Tables', quantity: 2, unit: 'Units', amount: 0.15 },
    { description: 'False Ceiling', quantity: 1, unit: 'Lot', amount: 0.15 },
    { description: 'Civil Work (wiring, plumbing, etc.)', quantity: 1, unit: 'Lot', amount: 0.10 }
  ],
  'Bedroom 4': [
    { description: 'Wardrobe with Sliding Doors', quantity: 1, unit: 'Unit', amount: 0.35 },
    { description: 'Bed with Storage', quantity: 1, unit: 'Unit', amount: 0.25 },
    { description: 'Side Tables', quantity: 2, unit: 'Units', amount: 0.15 },
    { description: 'False Ceiling', quantity: 1, unit: 'Lot', amount: 0.15 },
    { description: 'Civil Work (wiring, plumbing, etc.)', quantity: 1, unit: 'Lot', amount: 0.10 }
  ],
  'Bedroom 5': [
    { description: 'Wardrobe with Sliding Doors', quantity: 1, unit: 'Unit', amount: 0.35 },
    { description: 'Bed with Storage', quantity: 1, unit: 'Unit', amount: 0.25 },
    { description: 'Side Tables', quantity: 2, unit: 'Units', amount: 0.15 },
    { description: 'False Ceiling', quantity: 1, unit: 'Lot', amount: 0.15 },
    { description: 'Civil Work (wiring, plumbing, etc.)', quantity: 1, unit: 'Lot', amount: 0.10 }
  ],
  'Kitchen': [
    { description: 'Modular Kitchen Cabinets', quantity: 1, unit: 'Lot', amount: 0.40 },
    { description: 'Granite Counter Top', quantity: 1, unit: 'Sq.ft', amount: 0.30 },
    { description: 'Tall Unit Storage', quantity: 1, unit: 'Unit', amount: 0.15 },
    { description: 'Sink with Fittings', quantity: 1, unit: 'Set', amount: 0.10 },
    { description: 'Backsplash Tiles', quantity: 1, unit: 'Sq.ft', amount: 0.05 }
  ],
  'Bathroom': [
    { description: 'Vanity Unit', quantity: 1, unit: 'Unit', amount: 0.42 },
    { description: 'Shower Partition', quantity: 1, unit: 'Unit', amount: 0.35 },
    { description: 'Wall Tiles & Flooring', quantity: 1, unit: 'Sq.ft', amount: 0.23 }
  ]
};

const calculateDesignCharges = (totalAmount: number) => {
  const designChargePercentage = 0.08; // 8%
  const totalDesignCharges = totalAmount * designChargePercentage;
  
  return [
    { 
      description: 'Design Fee',
      amount: Math.round(totalDesignCharges * 0.65) // 65% of design charges
    },
    { 
      description: 'Site Visits & Supervision',
      amount: Math.round(totalDesignCharges * 0.15) // 15% of design charges
    },
    { 
      description: 'Project Management',
      amount: Math.round(totalDesignCharges * 0.20) // 20% of design charges
    }
  ];
};

const NOTES = [
  'THIS IS A TENTATIVE ESTIMATE (PROVIDES AN APPROX. ESTIMATE) AND IS SUBJECT TO MATERIAL REQUIREMENTS AND PRICES.',
  'THE RATES ARE ONLY ESTIMATED AND NOT REAL OR ACCORDING TO MARKET RATES.',
  '18% GST WILL BE APPLICABLE ON THE FINAL AMOUNT.',
  'APPLIANCES LIKE CHIMNEY, TV, AC, WATER PURIFIER, HANGING LIGHTS, CHANDELIER, WASHING MACHINE, FRIDGE ETC. ARE NOT ADDED IN THE QUOTE.',
  'MATTRESS AND BED-SHEETS ARE ALSO NOT ADDED.',
  'QUOTATION WILL BE PROVIDED AND FINALIZED AFTER THE 3D DESIGNING AND MATERIAL CONFIRMATION.',
  'STUDY CHAIR, PHOTO FRAMES & OTHER ARTEFACTS ARE ALSO NOT INCLUDED.',
  'BALCONY FURNITURE IS ALSO NOT INCLUDED.',
  'PANEL LIGHTS, PROFILE LIGHTS ETC. ARE NOT INCLUDED IN THE ESTIMATE.'
];

function EstimateSummaryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  if (!state) {
    React.useEffect(() => {
      navigate('/');
    }, [navigate]);
    return null;
  }

  const calculatePricePerSqFt = (area: number, category: string = 'standard'): number => {
    return PRICE_RANGES[category.toLowerCase() as keyof typeof PRICE_RANGES] || PRICE_RANGES.standard;
  };

  const formatIndianCurrency = (num: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const calculateEstimate = (): EstimateData => {
    let totalArea = 0;
    let rooms: Room[] = [];
    const category = state.category || 'standard';
    const totalRate = calculatePricePerSqFt(totalArea, category);

    const randomizeTotal = (amount: number): number => {
      const variation = Math.floor(Math.random() * 900) + 100; // Generates a number between 100-999
      return amount - (amount % 100) + variation; // Ensures it doesn’t end in 00
    };

    if (state.isVilla && state.floors) {
      state.floors.forEach(floor => {
        const floorArea = Number(floor.carpetArea) || 0;
        totalArea += floorArea;
        
        floor.rooms.forEach(room => {
          const roomArea = Number(room.carpetArea) || 0;
          const roomAmount = randomizeTotal(roomArea * totalRate);
          rooms.push({
            name: `${floor.name} - ${room.name}`,
            area: roomArea,
            rate: totalRate,
            amount: roomAmount
          });
        });
      });
    } else if (state.areaOption === 'rooms' && state.rooms) {
      state.rooms.forEach(room => {
        const roomArea = Number(room.carpetArea) || 0;
        totalArea += roomArea;
        const roomAmount = randomizeTotal(roomArea * totalRate);
        rooms.push({
          name: room.name,
          area: roomArea,
          rate: totalRate,
          amount: roomAmount
        });
      });
    } else if (state.totalCarpetArea) {
      totalArea = Number(state.totalCarpetArea);
      const numBedrooms = parseInt(state.layoutType?.replace('bhk', '') || '1', 10);
      const livingRoomArea = totalArea * 0.3;
      const masterBedroomArea = totalArea * 0.2;
      const bedroomArea = (totalArea - livingRoomArea - masterBedroomArea) / (numBedrooms - 1 > 0 ? numBedrooms - 1 : 1);

      rooms.push({ name: 'Living Room', area: livingRoomArea, rate: totalRate, amount: randomizeTotal(livingRoomArea * totalRate) });
      rooms.push({ name: 'Master Bedroom', area: masterBedroomArea, rate: totalRate, amount: randomizeTotal(masterBedroomArea * totalRate) });

      for (let i = 2; i <= numBedrooms; i++) {
        rooms.push({ name: `Bedroom ${i}`, area: bedroomArea, rate: totalRate, amount: randomizeTotal(bedroomArea * totalRate) });
      }

      rooms.push({ name: 'Kitchen', area: totalArea * 0.15, rate: totalRate, amount: randomizeTotal(totalArea * 0.15 * totalRate) });
      rooms.push({ name: 'Bathroom', area: totalArea * 0.1, rate: totalRate, amount: randomizeTotal(totalArea * 0.1 * totalRate) });
    }

    const totalAmount = rooms.reduce((sum, room) => sum + room.amount, 0);

    return {
      rooms,
      totalArea,
      totalAmount,
      category,
      date: new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
  };

  const calculateDetailedEstimate = (): DetailedEstimate => {
    const basicEstimate = calculateEstimate();
    const detailedRooms: DetailedRoom[] = basicEstimate.rooms.map((room, index) => {
      const isBedroom = room.name.toLowerCase().includes("bedroom");
      const isMasterBedroom = room.name === 'Master Bedroom';
      const roomKey = isMasterBedroom ? 'Master Bedroom' : isBedroom ? "Bedroom" : room.name;
      let baseItems: RoomItem[] = [];

      if (isMasterBedroom) {
        baseItems = ROOM_ITEMS['Master Bedroom'] || [];
      } else if (isBedroom) {
        baseItems = ROOM_ITEMS['Bedroom'] || [];
      } else {
        baseItems = ROOM_ITEMS[roomKey] || [];
      }

      let adjustedItems = baseItems.map((item, i, arr) => {
        let weightFactor = 0.1;
        // Assign weights based on the importance of the item
        if (item.description.includes("False Ceiling")) {
          weightFactor = 0.35; // Highest cost
        } else if (item.description.includes("TV Unit") || item.description.includes("Wardrobe")) {
          weightFactor = 0.25;
        } else if (item.description.includes("Bed with Storage")) {
          weightFactor = 0.20;
        } else if (item.description.includes("Civil Work")) {
          weightFactor = 0.15;
        }

        let baseCost = room.amount * weightFactor;
        let finalCost = Math.round(baseCost * (0.8 + Math.random() * 0.4)); // Add some randomness
        if (finalCost < 0) {
          finalCost = Math.abs(finalCost); // Ensure no negative values
        }

        // Ensure Civil Work has a minimum value
        if (item.description === "Civil Work (wiring, plumbing, etc.)" && finalCost < 500) {
          finalCost = 500 + Math.floor(Math.random() * 500); // Ensure it's at least 500
        }

        // Increase the cost of items in Master Bedroom by 15%
        if (isMasterBedroom) {
          finalCost = Math.round(finalCost * 1.15);
        }

        return {
          ...item,
          quantity: item.quantity,
          unit: item.unit,
          amount: finalCost
        };
      });

      // Ensure room total is distributed correctly
      let sum = adjustedItems.reduce((acc, item) => acc + item.amount, 0);
      let adjustment = room.amount - sum;

      // Adjust the last item's amount to match the exact room total
      if (adjustedItems.length > 0) {
        adjustedItems[adjustedItems.length - 1].amount += adjustment;
      }

      let roomName = room.name;
      if (isBedroom && room.name !== 'Master Bedroom') {
        const bedroomNumber = index;
        roomName = `Bedroom ${bedroomNumber}`;
      }

      return {
        ...room,
        name: roomName,
        items: adjustedItems
      };
    });

    const designCharges = calculateDesignCharges(basicEstimate.totalAmount);
    const subtotal = basicEstimate.totalAmount + designCharges.reduce((sum, charge) => sum + charge.amount, 0);
    const gst = subtotal * 0.18;

    return {
      rooms: detailedRooms,
      totalArea: basicEstimate.totalArea,
      designCharges,
      subtotal,
      gst,
      grandTotal: subtotal + gst,
      category: basicEstimate.category,
      date: basicEstimate.date,
      clientName: state.clientName,
      projectName: state.projectName
    };
  };

  const detailedEstimate = calculateDetailedEstimate();
  const projectType = state.layoutType ? `${state.layoutType.toUpperCase()} Project` : 'Custom Project';

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    doc.setFontSize(20);
    doc.text('CHOICEDGE INTERIOR DESIGN', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Detailed Estimate', pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Date: ${detailedEstimate.date}`, 15, 45);
    doc.text(`Category: ${detailedEstimate.category.toUpperCase()}`, 15, 52);
    doc.text('Email: info@choicedge.com', pageWidth - 15, 45, { align: 'right' });
    doc.text('Phone: +91 8956125439', pageWidth - 15, 52, { align: 'right' });
    doc.text(`Client Name: ${detailedEstimate.clientName}`, 15, 60);
    doc.text(`Project Name: ${detailedEstimate.projectName}`, 15, 67);
    doc.text(`Total Carpet Area: ${detailedEstimate.totalArea} sq.ft.`, 15, 74);

    let yPos = 90;

    detailedEstimate.rooms.forEach((room, index) => {
      doc.setFillColor(240, 240, 240);
      doc.rect(15, yPos, pageWidth - 30, 8, 'F');
      doc.setFont(undefined, 'bold');
      doc.text(`${room.name}`, 20, yPos + 6);
      yPos += 15;

      autoTable(doc, {
        head: [['Description', 'Qty', 'Unit', 'Amount (₹)']],
        body: room.items.map(item => [
          item.description,
          item.quantity,
          item.unit,
          formatIndianCurrency(item.amount)
        ]),
        startY: yPos,
        margin: { left: 20, right: 20 },
        styles: { fontSize: 10 },
        headStyles: { fillColor: [200, 200, 200] }
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      if (yPos > doc.internal.pageSize.height - 50) {
        doc.addPage();
        yPos = 20;
      }
    });

    autoTable(doc, {
      head: [['Execution Charges', 'Amount (₹)']],
      body: [
        ...detailedEstimate.designCharges.map(charge => [
          charge.description,
          formatIndianCurrency(charge.amount)
        ])
      ],
      startY: yPos,
      margin: { left: 20, right: 20 },
      styles: { fontSize: 10 },
      headStyles: { fillColor: [200, 200, 200] }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    autoTable(doc, {
      body: [
        ['Subtotal', formatIndianCurrency(detailedEstimate.subtotal)],
        ['GST (18%)', formatIndianCurrency(detailedEstimate.gst)],
        ['Grand Total', formatIndianCurrency(detailedEstimate.grandTotal)]
      ],
      startY: yPos,
      margin: { left: 20, right: 20 },
      styles: { fontSize: 10, fontStyle: 'bold' },
      theme: 'plain'
    });

    yPos = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Notes:', 20, yPos);
    doc.setFont(undefined, 'normal');
    NOTES.forEach((note, index) => {
      yPos += 7;
      doc.text(`${index + 1}. ${note}`, 20, yPos, { maxWidth: pageWidth - 40 });
    });

    doc.save('choicedge-detailed-estimate.pdf');
  };

  return (
    <Layout>
      <header className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-[#9c8b75] transition-colors flex items-center space-x-2 print:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
          <div className="text-right">
            <div className="text-gray-600 font-medium">
              {detailedEstimate.date}
            </div>
          </div>
        </div>
        
        <div className="border-t border-b border-gray-200 py-4 space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">CLIENT NAME</div>
              <div className="font-medium">{detailedEstimate.clientName}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">PROJECT NAME</div>
              <div className="font-medium">{detailedEstimate.projectName || projectType}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">
              {state.category === 'standard' ? 'ESTIMATION IN LAMINATE FINISH' : 'ESTIMATION'}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">
            Total Carpet Area: {state?.totalCarpetArea || state?.floors?.reduce((sum, floor) => sum + Number(floor.carpetArea), 0) || 0} sq.ft.
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Detailed Estimate
          </h1>
          <p className="text-gray-600">
            {detailedEstimate.category.charAt(0).toUpperCase() + detailedEstimate.category.slice(1)} Category
          </p>
        </div>

        <div className="space-y-8 mb-12">
          {detailedEstimate.rooms.map((room, roomIndex) => (
            <div key={roomIndex} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {room.name}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Quantity</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Unit</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {room.items.map((item, itemIndex) => (
                      <tr key={itemIndex} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-700">{item.description}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 text-right">{item.quantity}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 text-right">{item.unit}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 text-right">
                          {formatIndianCurrency(Math.max(0, Math.round(item.amount)))}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-semibold">
                      <td colSpan={3} className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Room Total:</td>
                      <td className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                        {formatIndianCurrency(Math.round(room.amount))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gray-50 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800">Execution Charges</h2>
          </div>
          <table className="w-full border-collapse mt-4">
            <tbody>
              {detailedEstimate.designCharges.map((charge, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">{charge.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 text-right">
                    {formatIndianCurrency(charge.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <table className="w-full border-collapse mt-4">
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-700">Subtotal</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-700 text-right">
                  {formatIndianCurrency(detailedEstimate.subtotal)}
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-700">GST (18%)</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-700 text-right">
                  {formatIndianCurrency(detailedEstimate.gst)}
                </td>
              </tr>
              <tr className="bg-gray-100 font-semibold">
                <td className="px-6 py-4 text-sm text-gray-700">Grand Total</td>
                <td className="px-6 py-4 text-sm text-gray-700 text-right">
                  {formatIndianCurrency(detailedEstimate.grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">NOTE:</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            {NOTES.map((note, index) => (
              <li key={index}>{index + 1}. {note}</li>
            ))}
          </ul>
        </div>

        <div className="flex justify-center space-x-4 print:hidden">
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Printer className="w-5 h-5 mr-2" />
            Print Estimate
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Download PDF
          </button>
        </div>

        <div className="text-center version">v0.5</div>
        <div className="hidden print:block mt-8 text-center text-sm text-gray-500">
          <p>This is a computer-generated estimate.</p>
          <p>© Choicedge | All Rights Reserved</p>
        </div>
      </main>

      <footer className="mt-12 border-t border-gray-200 pt-8 pb-4">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center space-y-4">
            <h3 className="font-bold text-gray-800">CHOICEDGE INTERIOR DESIGN</h3>
            <div className="text-sm text-gray-600">
              <p className="font-medium">Main Branch:</p>
              <p>Shradha House, Office Block No. SI-1, 6th Floor,</p>
              <p>Sardar Vallabhbhai Patel Marg (Kingsway), Nagpur-440001</p>
            </div>
            <div className="flex justify-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                +91 8956125439
              </div>
              <div>🌐 www.choicedge.com</div>
              <div>✉️ info@choicedge.com</div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              © 2025 Choicedge. Unauthorized sharing or distribution of this document is prohibited.
            </p>
          </div>
        </div>
      </footer>
    </Layout>
  );
}

export default EstimateSummaryPage;
