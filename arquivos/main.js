class FormErrors {
    constructor(){
        this.errors = {}
    }

    get(field){
        if (this.errors[field]){
            return this.errors[field]
        }
    }

    set(field, message){
        this.errors[field] = message;
    }

    clear(field){
        if ( field ) {
            
            delete this.errors[field]

        }else{
            this.errors = {};
        }
    }

    has(field) {
        return this.errors.hasOwnProperty(field)
    }

    any(){
          return Object.keys(this.errors).length > 0
    }
}
Vue.component('binomial-calculator', {
    template: `
        <section class="section">
            <h1 class="title">Binomial Distribution Calculator</h1>
            <p class="subtitle">
                A tool to calcule <strong>Binomial Probabilities</strong>!
            </p>
            <div class="columns is-desktop">
                <div class="column" >
                    <div class="field">
                        <label class="label">Probability of success in a single event</label>
                        <div class="control">
                            <input class="input" type="text"name="eventProbability"  v-model="eventProbability"  >
                        </div>
                        <p class="help is-danger" v-if="errors.has( 'eventProbability' )" v-text="errors.get( 'eventProbability' )"></p>
                    </div>
                    
                    <div class="field">
                        <label class="label">Number of trials</label>
                        <div class="control">
                            <input class="input" type="text"name="numberOfTrials"  v-model="numberOfTrials">
                            <p class="help is-danger" v-if="errors.has( 'numberOfTrials' )" v-text="errors.get( 'numberOfTrials' )"></p>
                        </div>
                    </div>
                    <div class="field">
                        <label class="label">Number of success</label>
                        <div class="control">
                            <input class="input" type="text"name="numberOfSuccess"   v-model="numberOfSuccess">
                            <p class="help is-danger" v-if="errors.has( 'numberOfSuccess' )"" v-text="errors.get( 'numberOfSuccess' )"></p>
                        </div>
                    </div>

                    <div class="field is-grouped">
                        <div class="control">
                            <button class="button is-link" @click="reset">Reset!</button>
                        </div>
                    </div>
                </div>

                <div class="column">
                    <div class="content">
                        <h5>Results</h5>
                        <table class="table is-bordered is-striped is-narrow">
                            <thead>
                                <tr>
                                    <th colspan="2">X ~ Bin({{this.numberOfSuccess | round }}, {{this.eventProbability | round }})</th>
                                </tr>
                            </thead> 
                            <tbody>
                                <tr>
                                        <td>P(X <  {{this.numberOfSuccess | round }})</td>
                                        <td>{{this.binomialProbabilities.less | round }}</td>
                                </tr>
                                <tr>
                                        <td>P(X <=  {{this.numberOfSuccess | round }})</td>
                                        <td>{{this.binomialProbabilities.lessOrEqual | round }}</td>
                                </tr>
                                <tr>
                                        <td>P(X = {{this.numberOfSuccess | round }})</td>
                                        <td>{{this.binomialProbabilities.equal | round }}</td>
                                </tr>
                                <tr>
                                        <td>P(X >  {{this.numberOfSuccess | round }})</td>
                                        <td>{{this.binomialProbabilities.greater | round }}</td>
                                </tr>
                                <tr>
                                        <td>P(X >=  {{this.numberOfSuccess | round }})</td>
                                        <td>{{this.binomialProbabilities.greaterOrEqual | round }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                </div>
                <chart-vue :labels="chartData.labels" :values="chartData.values" title="Probability Mass Function" type="bar"></chart-vue>
        </section>
    `,
    data(){
        return{
            chartData: {
                labels: [],
                values: []
            },
            eventProbability: 0.3,
            numberOfTrials: 20,
            numberOfSuccess: 12,
            binomialProbabilities: {
                'equal' : 0,
                'greater': 0,
                'less': 0,
                'lessOrEqual': 0,
                'greaterOrEqual': 0
            },
            errors: new FormErrors()
        }
    },
    watch: {
        eventProbability: function(){
            this.calculate()
        },
        numberOfTrials: function(){
            this.calculate()
        },
        numberOfSuccess: function(){
            this.calculate()
        }
    },
    filters: {
            round: (number => {
                if(String(number).split('.')[1] != undefined && String(number).split('.')[1].length > 4){
                    return number.toFixed(5);
                }
                return number;
            })
    },
    mounted(){
        this.calculate();
    },
    methods:{
        calculate(){
            this.verifyErrors();

            let factorial = (number => {
                let radian = 1;
                while(number > 1){
                    radian = radian*number--;
                }
                return radian;
            });

            this.chartData.values = [];
            this.chartData.labels = [];
            this.binomialProbabilities = {
                'equal': 0,
                'greater': 0,
                'less': 0,
                'lessOrEqual': 0,
                'greaterOrEqual': 0
            };

            for (let numberOfSuccess = 0; numberOfSuccess <= this.numberOfTrials; numberOfSuccess++) {

                let binomialCoefficient = factorial(this.numberOfTrials) / (factorial(numberOfSuccess) * factorial(this.numberOfTrials - numberOfSuccess));
                let prob = binomialCoefficient * Math.pow(this.eventProbability, numberOfSuccess) *
                                    Math.pow(1 - this.eventProbability, this.numberOfTrials - numberOfSuccess)

                if (numberOfSuccess < this.numberOfSuccess) {
                    this.binomialProbabilities.less +=  prob;
                }
                
                if (numberOfSuccess == this.numberOfSuccess) {
                    this.binomialProbabilities.equal = prob;
                }

                if (numberOfSuccess > this.numberOfSuccess) {
                    this.binomialProbabilities.greater += prob;
                }

                this.chartData.labels.push(numberOfSuccess);
                this.chartData.values.push(prob);
            }
            
            this.binomialProbabilities.greaterOrEqual = this.binomialProbabilities.equal + this.binomialProbabilities.greater;
            this.binomialProbabilities.lessOrEqual = this.binomialProbabilities.equal + this.binomialProbabilities.less;
        },
        verifyErrors(){
            let fields = ['eventProbability' , 'numberOfTrials', 'numberOfSuccess'];
            this.errors.clear();

            fields.forEach(function(field) {   
                if ( this[field] < 0 ) {
                    this.errors.set(field, 'This value cannot be negative');
                }

                if (Number.isNaN( parseFloat(this[field]))  || String(this[field]).trim() == "") {
                    this.errors.set(field, 'This must be a number');
                }
            }, this)

            if ( this.eventProbability > 1){
                this.errors.set('eventProbability', 'The probability must be a number between 0 and 1');
            }else{
                this.errors.clear('eventProbability');
            }

            if (parseFloat(this.numberOfSuccess) > parseFloat(this.numberOfTrials)) {
                this.errors.set('numberOfSuccess', 'The number of success can not be greater than the number of trials');
            }else{
                this.errors.clear('numberOfSuccess')
            }
        },
        reset(){
            this.eventProbability = 0.5;
            this.numberOfTrials = 5;
            this.numberOfSuccess = 3;
            this.binomialProbabilities = {
                'equal': 0,
                'greater': 0,
                'less': 0,
                'lessOrEqual': 0,
                'greaterOrEqual': 0
            };
            this.errors.calculate();
        }
    }
});

Vue.component('chart-vue', {
    template: '<canvas id="test"></canvas>',
    props: ['labels', 'values', 'color', 'type', 'title'],
    props: {
        labels: {},
        values: {},
        color: {
            default: 'rgba(220, 220, 220, .2)'
        },
        type: {
            default: 'line'
        },
        title: {}
    },
    data(){
        return {
            chart: 0
        }
    },
    watch: {
        values: function () { 
            if (this.chart){
                this.chart.destroy();
            }
            this.render();
        }
    },
    methods: {
        render(){
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
                        label:  (tooltipItem, data) => {
                            return  tooltipItem.yLabel;
                        },
                        title: (tooltipItem, data) => {
                            return `Probability of getting ${tooltipItem[0].xLabel}`;
                        }
                    }
                },
            }

            this.chart = new Chart(this.$el.getContext('2d'), { type: this.type, data: data, options });
        }
    }

})
new Vue({
	el: '#app'
})