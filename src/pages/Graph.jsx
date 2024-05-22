import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto'; // Import Chart.js
import { throttle } from 'lodash';

const Graph = ({ frequencyData }) => {
  const canvasRef = useRef(null);
  let chartInstance = null;

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Initialize Chart.js instance
    chartInstance = new Chart(context, {
      type: 'line',
      data: {
        labels: frequencyData ? frequencyData.map((_, index) => index) : [],
        datasets: [
          {
            label: 'Frequency Data',
            data: frequencyData || [],
            borderColor: 'blue',
            backgroundColor: 'transparent',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Frequency',
            },
          },
        },
      },
    });

    // Throttle the updateFrequencyData function to limit the frequency of updates
    const throttledUpdateFrequencyData = throttle(updateFrequencyData, 50000); // Adjust throttle interval as needed

    function updateFrequencyData() {
      if (chartInstance) {
        chartInstance.data.datasets[0].data = frequencyData || [];
        chartInstance.update();
      }
    }

    // Cleanup function
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [frequencyData]);

  return <canvas ref={canvasRef} width={800} height={200} />;
};

export default Graph;
