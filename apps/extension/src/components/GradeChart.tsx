import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface GradeChartProps {
    data: {
        A: number;
        B: number;
        C: number;
        D: number;
        F: number;
        W: number;
    };
}

const GradeChart: React.FC<GradeChartProps> = ({ data }) => {
    const chartData = {
        labels: ['A', 'B', 'C', 'D', 'F', 'W'],
        datasets: [
            {
                label: '% of Students',
                data: [data.A, data.B, data.C, data.D, data.F, data.W],
                backgroundColor: [
                    '#F15A22', // UTSA Orange
                    '#032044', // UTSA Blue
                    '#054088',
                    '#EBE6E2',
                    '#666666',
                    '#F8F4F1'
                ],
                borderRadius: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => `${context.parsed.y}%`,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    callback: (value: any) => `${value}%`,
                    font: { size: 10 }
                },
            },
            x: {
                ticks: { font: { size: 10, weight: 'bold' } }
            }
        },
    };

    return (
        <div className="h-[150px] w-full mt-2">
            <Bar data={chartData as any} options={options as any} />
        </div>
    );
};

export default GradeChart;
