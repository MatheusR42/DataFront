Vue.component('chart-vue', {
    template: '<canvas></canvas>',
    props: {
        labels: {},
        values: {},
        title: {},
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
                options
            });
        }
    },
    mounted(){
        this.render();
    }

})