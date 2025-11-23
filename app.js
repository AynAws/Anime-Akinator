window.app = Vue.createApp({
    data() {
        return { // app-scope variables
            characters: [],
            originalCharacters: [],
            current: []
        }
    },
    mounted() { // on load, run...
        fetch('characters.json')
            .then(res => res.json())
            .then(data => {
                this.characters = data
                this.originalCharacters = data
                this.current = this.askNextQuestion()
            })
    },
    methods: { // functions
        getVaryingProperties(items) { // gets keys from character properties
            const prop = Object.keys(items[0]) // prop is a list of all the remaining keys

            return prop.filter(prop => {
                if (prop === "name") return false
                const values = new Set(items.map(i => i[prop])) // values is a list of all remaining keys without duplicates
                return values.size > 1 // returns whether the key is useful or not
            })
        },
        chooseBestProperty(items) { // chooses the best property for the next question
            const prop = this.getVaryingProperties(items) // gets a useful key
            if (prop.length === 0) return null // cuts the function if there are no more useful questions left

            const total = items.length
            let bestProp = prop[0]
            let bestDiff = total

            for (const p of prop) {
                const values = [...new Set(items.map(i => i[p]))]
                let bestPropDiff = total

                for (const value of values) {
                    const count = items.filter(item => item[p] === value).length
                    const diff = Math.abs(total / 2 - count)
                    if (diff < bestPropDiff) bestPropDiff = diff
                }

                if (bestPropDiff < bestDiff) {
                    bestDiff = bestPropDiff
                    bestProp = p
                }
            }
            return bestProp
        },
        getCandidateValue(items, prop) { // picks most effective value to ask about
            const values = [...new Set(items.map(i => i[prop]))]
            if (values.length === 0) return null
            const total = items.length
            let bestValue = values[0] // bestValue equals names
            let bestDiff = total // bestDiff is high so that names are always swapped out unless there aren't other options
            for (const value of values) {
                const count = items.filter(item => item[prop] === value).length
                const diff = Math.abs(total / 2 - count)
                if (diff < bestDiff) {
                    bestDiff = diff
                    bestValue = value
                }
            }
            return bestValue
        },
        applyAnswer(prop, value, answer) {
            if (answer) {
                this.characters = this.characters.filter(item => item[prop] === value)
            } else {
                this.characters = this.characters.filter(item => item[prop] !== value)
            }
        },
        askNextQuestion() {
            const prop = this.chooseBestProperty(this.characters)
            if (!prop) {
                if (this.characters.length === 1) return ["Your character is " + this.characters[0].name + "."]
                else if (this.characters.length === 0) return ["No such character found."]
                else {
                    const names = this.characters.map(c => c.name).join(", ")
                    return ["Possible characters are " + names + "."]
                }
            }
            const value = this.getCandidateValue(this.characters, prop)
            if (typeof value === "boolean") {
                return [`Does this character ${prop.replace("_", " ")}?`, prop, value]
            } else {
                return [`Is this character's ${prop.replace("_", " ")} ${value || 'unknown or N/A'}?`, prop, value]
            }
        },
        choose(answer) {
            const prop = this.current[1]
            const value = this.current[2]
            this.applyAnswer(prop, value, answer)
            this.current = this.askNextQuestion()
        }
    }
}).mount('#app')