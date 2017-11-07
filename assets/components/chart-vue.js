Vue.component('chart-vue', {
    template: '<canvas></canvas>',
    props: {
        labels: {},
        values: {},
        title: {},
        line: {},
        color: {
            default: 'rgba(220, 220, 220, .2)'
        },
        type: {
            default: 'line'
        },
        beforeTooltips: {
            default: 'Probability of getting'
        },
        beginAtZero: {
            default: true
        }
    },
    data() {
        return {
            chart: 0
        }
    },
    watch: {
        values: function () {
            if (this.chart) {
                this.chart.destroy();
            }
            this.render();
        },
        line: function () {
            if (this.chart) {
                this.chart.destroy();
            }
            this.render();
        }
    },
    methods: {
        render() {
            var data = {
                labels: this.labels,
                datasets: [{
                    label: this.title,
                    data: this.values,
                    backgroundColor: 'rgba(54, 162, 235, .2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            }

            var options = {
                title: {
                    display: true,
                    text: this.title,
                    fontSize: 20
                },
                legend: {
                    display: false
                },
                label: {
                    enabled: false
                },
                tooltips: {
                    displayColors: false,
                    callbacks: {
                        label: (tooltipItem, data) => {
                            return tooltipItem.yLabel;
                        },
                        title: (tooltipItem, data) => {
                            return `${this.beforeTooltips} ${tooltipItem[0].xLabel}`;
                        }
                    }
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: this.beginAtZero
                        }
                    }]
                }
            }

            this.chart = new Chart(this.$el.getContext('2d'), {
                type: this.type,
                data: data,
                options,
                lineAtIndex: this.line
            });
        }
    },
    mounted(){
        const verticalLinePlugin = {
            /*
            plugin adapted from https://stackoverflow.com/a/43092029
            */
            renderVerticalLine: function (chartInstance, pointIndex) {
                // const lineLeftOffset = this.getLinePosition(chartInstance, pointIndex);
                const context = chartInstance.chart.ctx;
                
                let yScale = chartInstance.scales['y-axis-0'];
                let xScale = chartInstance.scales['x-axis-0'];
                let lineLeftOffset = xScale.getPixelForValue(undefined, pointIndex - 1);

                // render vertical line
                context.beginPath();
                context.strokeStyle = '#ff0000';
                context.moveTo(lineLeftOffset, yScale.top);
                context.lineTo(lineLeftOffset, yScale.bottom);
                context.stroke();
          
                // write label
                context.fillStyle = "#ff0000";
                context.textAlign = 'center';
                context.font="12px Georgia";
                context.fillText('Expected value', lineLeftOffset, yScale.top);
            },
          
            afterDatasetsDraw: function (chart, easing) {
                if (chart.config.lineAtIndex) {
                    chart.config.lineAtIndex.forEach(pointIndex => this.renderVerticalLine(chart, pointIndex));
                }
            }
        };
        
        Chart.plugins.register(verticalLinePlugin);
        
        this.render();
    }

})