// TimeForm.jsx
import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const TimeForm = () => {
  const [times, setTimes] = useState([{ checkIn: '', checkOut: '' }]);
  const [remainingTimes, setRemainingTimes] = useState({ office: '0.00', break: '0.00', leaving: '00:00' });

  const handleChange = (index, field, value) => {
    const newTimes = [...times];
    newTimes[index][field] = value;
    setTimes(newTimes);
  };

  const addTimeField = () => {
    setTimes([...times, { checkIn: '', checkOut: '' }]);
  };

  const removeTimeField = (index) => {
    if (times.length === 1) return;
    setTimes(times.filter((_, i) => i !== index));
  };

  const calculateTimes = (uploadedTimes = times) => {
    const sortedTimes = [...uploadedTimes].sort((a, b) => {
      const [hoursA, minutesA] = a.checkIn.split(':').map(Number);
      const [hoursB, minutesB] = b.checkIn.split(':').map(Number);
      return hoursA * 60 + minutesA - (hoursB * 60 + minutesB);
    });

    let totalOfficeTime = 0;
    let totalBreakTime = 60; // 1 hour in minutes

    sortedTimes.forEach(({ checkIn, checkOut }, index) => {
      if (checkIn) {
        const checkInTime = new Date(`2025-06-03T${checkIn}:00`);
        let duration = 0;

        if (checkOut) {
          const checkOutTime = new Date(`2025-06-03T${checkOut}:00`);
          duration = (checkOutTime - checkInTime) / (1000 * 60 * 60);
        } else {
          const currentTime = new Date();
          const currentTimeAdjusted = new Date(`2025-06-03T${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}:00`);
          duration = (currentTimeAdjusted - checkInTime) / (1000 * 60 * 60);
        }

        totalOfficeTime += duration;
      }

      if (index > 0) {
        const previousCheckOut = sortedTimes[index - 1].checkOut;
        if (previousCheckOut && checkIn) {
          const previousCheckOutTime = new Date(`2025-06-03T${previousCheckOut}:00`);
          const currentCheckInTime = new Date(`2025-06-03T${checkIn}:00`);
          const breakDuration = (currentCheckInTime - previousCheckOutTime) / (1000 * 60);
          totalBreakTime -= breakDuration;
        }
      }
    });

    const formatTime = (time) => {
      const hours = Math.floor(Math.abs(time) / 60);
      const minutes = Math.round(Math.abs(time) % 60);
      const sign = time < 0 ? '-' : '';
      return `${sign}${hours}h ${minutes}m`;
    };

    const remainingOfficeTime = Math.max(9 - totalOfficeTime, 0);

    const calculateLeavingTime = (remainingOfficeTime) => {
      const currentTime = new Date();
      const leavingTime = new Date(currentTime.getTime() + remainingOfficeTime * 60 * 60 * 1000);
      return `${leavingTime.getHours().toString().padStart(2, '0')}:${leavingTime.getMinutes().toString().padStart(2, '0')}`;
    };

    setRemainingTimes({
      office: formatTime(remainingOfficeTime * 60),
      break: formatTime(totalBreakTime),
      leaving: calculateLeavingTime(remainingOfficeTime),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateTimes();
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const validData = jsonData.filter((row) => row['In time'] && /^\d{2}:\d{2}$/.test(row['In time']));

        const sortedData = validData.sort((a, b) => {
          const [hoursA, minutesA] = a['In time'].split(':').map(Number);
          const [hoursB, minutesB] = b['In time'].split(':').map(Number);
          return hoursA * 60 + minutesA - (hoursB * 60 + minutesB);
        });

        const formattedTimes = sortedData.map((row) => ({
          checkIn: row['In time'] || '',
          checkOut: row['Out time'] || '',
        }));

        setTimes(formattedTimes);
        calculateTimes(formattedTimes);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="w-full max-w-2xl" style={{ height: 'auto' }}>
        <form
          onSubmit={handleSubmit}
          className="relative z-10 space-y-8 backdrop-blur-md bg-orange-500/30 p-8 rounded-lg shadow-2xl border border-orange-600"
        >
          <h2 className="text-4xl font-bold text-red-700 text-center mb-6">Time Tracker</h2>
          {times.map((time, idx) => (
            <div
              key={idx}
              className="relative z-10 w-full max-w-3xl p-6 backdrop-blur-md bg-orange-600/30 shadow-2xl rounded-xl border border-orange-500"
            >
              <div className="flex flex-row w-full gap-4">
                <div className="flex flex-col w-full md:w-1/2">
                  <label className="text-sm font-semibold text-red-700 mb-2">Check In</label>
                  <input
                    type="text"
                    value={time.checkIn}
                    onChange={(e) => handleChange(idx, 'checkIn', e.target.value)}
                    required
                    placeholder="HH:MM"
                    className="px-4 py-2 border border-orange-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800 bg-orange-200/20 shadow-sm"
                  />
                </div>
                <div className="flex flex-col w-full md:w-1/2">
                  <label className="text-sm font-semibold text-red-700 mb-2">Check Out</label>
                  <input
                    type="text"
                    value={time.checkOut}
                    onChange={(e) => handleChange(idx, 'checkOut', e.target.value)}
                    placeholder="HH:MM"
                    className="px-4 py-2 border border-orange-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800 bg-orange-200/20 shadow-sm"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeTimeField(idx)}
                className="absolute top-2 right-2 p-0 focus:outline-none focus:ring-2 focus:ring-red-400"
                disabled={times.length === 1}
                title="Remove this entry"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-600 hover:text-red-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <div className="relative z-10 w-full max-w-3xl p-6 backdrop-blur-md bg-orange-600/30 shadow-2xl rounded-xl border border-orange-500 flex flex-col items-center">
            <p className="text-lg font-semibold text-red-700">Remaining Office Time: {remainingTimes.office}</p>
            <p className="text-lg font-semibold text-red-700">Remaining Break Time: {remainingTimes.break}</p>
            <p className="text-lg font-semibold text-red-700">Leaving Time: {remainingTimes.leaving}</p>
          </div>
          <div className="flex flex-col items-center gap-4 mt-6">
            <button
              type="button"
              onClick={addTimeField}
              className="w-full bg-orange-800/30 hover:bg-orange-800/40 text-red-700 font-semibold px-6 py-3 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              Add More
            </button>
            <button
              type="submit"
              className="w-full bg-orange-800/30 hover:bg-orange-800/40 text-red-700 font-semibold px-8 py-3 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              Submit
            </button>
          </div>
          <div className="flex flex-col items-center mt-6">
            <label
              htmlFor="file-upload"
              className="bg-orange-800/30 hover:bg-orange-800/40 text-red-700 font-semibold px-6 py-3 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v16h16V4H4zm4 4h8m-8 4h8m-8 4h8" />
              </svg>
              Upload Excel File
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimeForm;
