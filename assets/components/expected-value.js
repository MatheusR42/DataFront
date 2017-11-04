Vue.component('expected-value',{
    template: `
        <section class="section">
            <div class="columns is-desktop">
                <div class="column has-text-centered" >
                    <h2 class="title is-size-5 has-text-weight-bold">Events probabilities</h2>
                    
                    <div class="field" v-for="(event, index) in events">
                        <div class="field-body">
                            <div class="field is-grouped">
                                <p class="control is-expanded">
                                    <label class="label">Event({{index + 1}})</label>
                                </p>

                                <p class="control is-expanded">
                                    <input class="input" type="text" placeholder="Value" v-model="event.value">
                                </p>

                                <p class="control is-expanded">
                                    <input class="input" type="text" placeholder="Probability" v-model="event.probability">
                                </p>

                                <p class="control is-expanded">
                                    <button class="button" @click="remove(index)">
                                        <span class="icon is-small has-text-grey-dark">
                                            <i class="fa fa-times" aria-hidden="true"></i>
                                        </span>
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="field is-grouped is-grouped-right">
                        <div class="field-label is-normal control">
                            <label class="label control has-text-right">
                                Add more
                            </label>
                        </div>
                        <p class="control">
                            <button class="button" @click="add">
                                <span class="icon is-small has-text-info">
                                    <i class="fa fa-plus" aria-hidden="true"></i>
                                </span>
                            </button>
                        </p>
                    </div>
                </div>

                <div class="column">
                    <div class="content">
                        <chart-vue :labels="labels" :values="values" title="Probability Mass Function" type="bar"></chart-vue>
                    </div>
                </div>
            </div>
        </section>
    `,
    data() {
        return {
            events: [
                {
                    value: 1,
                    probability: .4
                },
                {
                    value: 2,
                    probability: .3
                },
                {
                    value: 3,
                    probability: .1
                },
                {
                    value: 4,
                    probability: .2
                }
            ]
        }
    },
    computed: {
        labels: function () {
            let labels = [];

            this.events.forEach(function(event) {
                labels.push(event.value);
            });

            return labels;
        },
        values: function () {
            let values = [];

            this.events.forEach(function(event) {
                values.push(event.probability);
            });

            return values;
        }
    },
    methods: {
        add() {
            this.events.push({
                value: '',
                probability: ''
            });

            this.$nextTick(() => {
                let inputs = document.querySelectorAll('input[placeholder="Value"]');
                let lastInput = inputs[inputs.length - 1];
                lastInput.focus();
            })
        },
        remove(index){
            this.events.pop(index);
        }
    }
})