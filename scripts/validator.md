# Validating data: mental model

## The flow is:

**validate → flatten → seed**

```js
// Example json data arrangement for each courseCode file in <../data/  >
// to be validated before seeding or flatting to the actual data structure.
{
  "courseCode": "PHY102",
  "department": "COMP_SCI",
  "level": "100",
  "weeks": {
    "sem2_wk1": {
      "semester": 2,
      "week": 1,
      "topic": "Fundamental Forces and Introduction to Electrostatics",
      "questions": [
        { "questionText": "...", "options": [...], "correctOption": "A", "explanation": "..." },
        { "questionText": "...", "options": [...], "correctOption": "B", "explanation": "..." }
      ]
    }
  }
}
```

## Below are to be validated on file structure above 👆:

```txt
fileSchema        ← validates the root object
  └── weekSchema      ← validates each week inside weeks{}
        └── questionSchema  ← validates each question inside questions[]

```

**Root level:**

- courseCode exist,
- department exist,
- level exist,

**WeekSchema level:**

- semester exist, and it is a number: either 1 or 2,
- week exist, btw 1 or 15,
- topic exist,
- exactly 100 questions per week,

**QuestionSchema level:**

- questionText exist,
- options is an array of 4 items,
- every option has label and text,
- all labels are exactly: "A", "B", "C", "D": no duplicate, no missing
- correct option value is one of the label's
- explanation exist

## once you are done validating:

```js
// Example Question document to be seeded in mongoose:
{
  "questionText": "what is the primary function of an operating system?",
  "topic": "computer basics",
  "level": "100",
  "department": "COMP_SCI"
  "weeks": 1,
  "semester": 1,
  "courseCode": "CBT101",
  "options": [
    { "text": "manages hardware and software resources", "label": "A" },
    { "text": "creates internet connections", "label": "B" },
    { "text": "stores files only", "label": "C" },
    { "text": "designs web pages", "label": "D" }
  ],
  "correctOption": "A",
  "explanation": "An operating system manages hardware and software resources and provides common services for programs."

}
```

- The next step is to flatten
- In your seed file, flatten the jsons to match the immediate structure above
- then proceed to seeding
- good luck 🫠
