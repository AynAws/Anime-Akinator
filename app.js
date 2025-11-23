window.app = Vue.createApp({
    data() {
        return { // app-scope variables
            characters: [],
            originalCharacters: [],
            current: [],
            questions: {
                skin_color: "What is this character's skin color?",
                hair_color: "What is this character's hair color?",
                show: "What show is this character from?",
                initial_age: "How old is this character at the beginning?",
                final_age: "How old is this character at the end?",
                sex: "What is this character's sex?"
            }
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
                const values = new Set(items.map(i => i[prop])) // values is a list of all remaining keys without duplicated
                return values.size > 1 // returns whether the key is useful or not
            })
        },
        chooseBestProperty(items) { // chooses the best property for the next question
            const props = this.getVaryingProperties(items) // gets a useful key
            if (props.length === 0) return null // cuts the function if there are no more useful questions left
            let best = props[0]
            let bestCount = new Set(items.map(i => i[best])).size // counts the amount of values in best
            for (const p of props) {
                const count = new Set(items.map(i => i[p])).size // counts the amount of values in count
                if (count > bestCount) { // swaps best for the more effective property
                    best = p
                    bestCount = count
                }
            }
            return best
        },
        getOptionsForProperty(items, prop) {
            return [...new Set(items.map(i => i[prop]))] // returns all options for the prop without duplicates
        },
        applyAnswer(prop, answer) {
            this.characters = this.characters.filter(item => item[prop] === answer) // narrows down the list based off of the answer
        },
        askNextQuestion() { // returns the next question and the associated options or returns the guessed character
            const prop = this.chooseBestProperty(this.characters)
            if (prop) { // asks next quesion
                const question = this.questions[prop]
                const options = this.getOptionsForProperty(this.characters, prop)
                return [question, options]
            } else {
                if (this.characters.length === 1) { // returns single character
                    return ["Your character is " + this.characters[0].name + "."]
                } else if (this.characters.length === 0) { // returns no characters
                    return ["No such characters found."]
                } else { // returns multiple characters
                    let str = []
                    for (let i = 0; i < this.characters.length; i++) {
                        if (i + 1 === this.characters.length) {
                            str += " and "
                        } else {
                            str += ", "
                        }
                        str += this.characters[i].name
                    }
                    return ["Possible characters are: " + str + "."]
                }
            }

        },
        choose(answer) {
            this.applyAnswer(this.chooseBestProperty(this.characters), answer)
            this.current = this.askNextQuestion()
        }
    }
}).mount('#app')