Vue.component('binomial-calculator', {
    template: `
        <section class="section">
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
    data() {
        return {
            chartData: {
                labels: [],
                values: []
            },
            eventProbability: 0.3,
            numberOfTrials: 100,
            numberOfSuccess: 35,
            binomialProbabilities: {
                'equal': 0,
                'greater': 0,
                'less': 0,
                'lessOrEqual': 0,
                'greaterOrEqual': 0
            },
            errors: new FormErrors()
        }
    },
    watch: {
        eventProbability: function () {
            this.calculate()
        },
        numberOfTrials: function () {
            this.calculate()
        },
        numberOfSuccess: function () {
            this.calculate()
        }
    },
    filters: {
        round: (number => {
            if (String(number).split('.')[1] != undefined && String(number).split('.')[1].length > 4) {
                return number.toFixed(5);
            }
            return number;
        })
    },
    mounted() {
        this.calculate();
    },
    methods: {
        calculate() {
            this.verifyErrors();

            let factorial = (number => {
                let radian = 1;
                while (number > 1) {
                    radian = radian * number--;
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
                    this.binomialProbabilities.less += prob;
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
        verifyErrors() {
            let fields = ['eventProbability', 'numberOfTrials', 'numberOfSuccess'];
            this.errors.clear();

            fields.forEach(function (field) {
                if (this[field] < 0) {
                    this.errors.set(field, 'This value cannot be negative');
                }

                if (Number.isNaN(parseFloat(this[field])) || String(this[field]).trim() == "") {
                    this.errors.set(field, 'This must be a number');
                }
            }, this)

            if (this.eventProbability > 1) {
                this.errors.set('eventProbability', 'The probability must be a number between 0 and 1');
            } else {
                this.errors.clear('eventProbability');
            }

            if (parseFloat(this.numberOfSuccess) > parseFloat(this.numberOfTrials)) {
                this.errors.set('numberOfSuccess', 'The number of success can not be greater than the number of trials');
            } else {
                this.errors.clear('numberOfSuccess')
            }
        },
        reset() {
            this.eventProbability = .3;
            this.numberOfTrials = 100;
            this.numberOfSuccess = 35;
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