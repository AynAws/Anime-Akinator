window.app = Vue.createApp({
    data() {
        return { // app-scope variables
            characters: [],
            originalCharacters: [],
            current: [],
            askedProps: new Set(),
            ignoredProps: new Set([
                "name",
                "english_voice_actor",
                "japanese_voice_actor"
            ])
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

                const set = new Set()

                for (const item of items) {
                    const v = item[prop]
                    if (Array.isArray(v)) {
                        v.forEach(x => set.add(x))
                    } else {
                        set.add(v)
                    }
                }
                return set.size > 1
            })
        },
        chooseBestProperty(items) { // chooses the best property for the next question
            const prop = this.getVaryingProperties(items) // gets a useful key
            if (prop.length === 0) return null // cuts the function if there are no more useful questions left

            const total = items.length
            let bestProp = prop[0]
            let bestDiff = total

            for (const p of prop) {
                const values = new Set()
                for (const item of items) {
                    const v = item[p]
                    if (Array.isArray(v)) v.forEach(x => values.add(x))
                    else values.add(v)
                }

                let propBest = total

                for (const value of values) {
                    let count = 0
                    for (const item of items) {
                        const v = item[p]
                        if (Array.isArray(v)) {
                            if (v.includes(value)) count++
                        } else if (v === value) {
                            count++
                        }
                    }
                    const diff = Math.abs(total / 2 - count)
                    if (diff < propBest) propBest = diff
                }

                if (propBest < bestDiff) {
                    bestDiff = propBest
                    bestProp = p
                }
            }
            return bestProp
        },
        getCandidateValue(items, prop) {
            const values = new Set()

            for (const item of items) {
                const v = item[prop]
                if (Array.isArray(v)) v.forEach(x => values.add(x))
                else values.add(v)
            }

            const list = [...values]
            if (list.length === 0) return null

            const total = items.length
            let bestValue = list[0]
            let bestDiff = total

            for (const value of list) {
                let count = 0
                for (const item of items) {
                    const v = item[prop]
                    if (Array.isArray(v) && v.includes(value)) count++
                    else if (v === value) count++
                }

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
                this.characters = this.characters.filter(item => {
                    const v = item[prop]
                    if (Array.isArray(v)) return v.includes(value)
                    return v === value
                })
            } else {
                this.characters = this.characters.filter(item => {
                    const v = item[prop]
                    if (Array.isArray(v)) return !v.includes(value)
                    return v !== value
                })
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