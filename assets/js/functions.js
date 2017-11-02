class FormErrors {
    constructor() {
        this.errors = {}
    }

    get(field) {
        if (this.errors[field]) {
            return this.errors[field]
        }
    }

    set(field, message) {
        this.errors[field] = message;
    }

    clear(field) {
        if (field) {
            delete this.errors[field]
        } else {
            this.errors = {};
        }
    }

    has(field) {
        return this.errors.hasOwnProperty(field)
    }

    any() {
        return Object.keys(this.errors).length > 0
    }
}

new Vue({
    el: '#app'
})