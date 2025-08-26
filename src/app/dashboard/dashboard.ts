import { Component, OnInit } from '@angular/core';
import { ApiService } from '../core/services/api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  // Dashboard metrics
  upcomingOrders: number = 0;
  totalOrdersThisMonth: number = 0;
  revenueThisMonth: number = 0;
  customersThisYear: number = 0;
  // walletBalance: number = 0;
  totalEarnings: number = 0;
  
  // Chart options
  bookingAnalysisChart: any = {};
  performanceRatingChart: any = {};
  bookingCalendarChart: any = {};
  financialChart: any = {};
  
  // Date filters - ADD THESE MISSING PROPERTIES
  selectedMonthFilter: string = 'thisMonth';
  selectedYearFilter: string = 'thisYear';
  
  // API endpoint
  private dashboardApi = 'ServiceProvider/providerdashboardstats';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
  this.api.get<any>(this.dashboardApi).subscribe({
      next: (data) => {
        // Update metrics
        this.upcomingOrders = data.upcomingOrders;
        this.totalOrdersThisMonth = data.totalOrdersThisMonth;
        this.revenueThisMonth = data.revenueThisMonth;
        this.customersThisYear = data.customersThisYear;
        // this.walletBalance = data.walletBalance;
        this.totalEarnings = data.totalEarnings;
        
        // Initialize charts with data from servlet
        this.initBookingAnalysisChart(data.bookingAnalysis);
        this.initPerformanceRatingChart(data.performanceRating);
        this.initBookingCalendarChart(data.bookingCalendar);
        this.initFinancialChart(data.financialData);
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
      }
    });
  }

  // ADD THIS MISSING METHOD
  onFilterChange(): void {
    // Reload data when filters change
    this.loadDashboardData();
  }

  initBookingAnalysisChart(data: any): void {
    this.bookingAnalysisChart = {
      series: data.series,
      chart: {
        type: 'donut',
        height: 350
      },
      labels: data.labels,
      colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0'],
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    };
  }

  initPerformanceRatingChart(data: any): void {
    this.performanceRatingChart = {
      series: [{
        name: 'Average Rating',
        data: data.ratings
      }],
      chart: {
        height: 350,
        type: 'bar'
      },
      plotOptions: {
        bar: {
          borderRadius: 10,
          dataLabels: {
            position: 'top'
          }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function(val: number) {
          return val.toFixed(1);
        },
        offsetY: -20,
        style: {
          fontSize: '12px',
          colors: ["#304758"]
        }
      },
      xaxis: {
        categories: data.categories,
        position: 'bottom',
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        crosshairs: {
          fill: {
            type: 'gradient',
            gradient: {
              colorFrom: '#D8E3F0',
              colorTo: '#BED1E6',
              stops: [0, 100],
              opacityFrom: 0.4,
              opacityTo: 0.5
            }
          }
        },
        tooltip: {
          enabled: true
        }
      },
      yaxis: {
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        labels: {
          show: false,
          formatter: function(val: number) {
            return val.toFixed(1);
          }
        }
      },
      title: {
        text: 'Service Performance Ratings',
        floating: true,
        offsetY: 0,
        align: 'center',
        style: {
          color: '#444'
        }
      }
    };
  }

  initBookingCalendarChart(data: any): void {
    this.bookingCalendarChart = {
      series: [{
        name: 'Bookings',
        data: data.bookings
      }],
      chart: {
        height: 350,
        type: 'line',
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'straight'
      },
      title: {
        text: 'Bookings Over Time',
        align: 'left'
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'],
          opacity: 0.5
        }
      },
      xaxis: {
        categories: data.categories
      }
    };
  }

  initFinancialChart(data: any): void {
    this.financialChart = {
      series: [{
        name: 'Revenue',
        data: data.revenue
      }],
      chart: {
        type: 'area',
        height: 350,
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'straight'
      },
      subtitle: {
        text: 'Revenue Movements',
        align: 'left'
      },
      labels: data.categories,
      xaxis: {
        type: 'category'
      },
      yaxis: {
        opposite: false,
        labels: {
          formatter: function(val: number) {
            return '$' + val.toFixed(2);
          }
        }
      },
      legend: {
        horizontalAlign: 'left'
      },
      tooltip: {
        y: {
          formatter: function(val: number) {
            return '$' + val.toFixed(2);
          }
        }
      }
    };
  }
}