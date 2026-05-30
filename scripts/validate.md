# question doc arrangement to take note!

## 1 .

```js
// Example Question document to be seeded in mongoose:
// NB: All are required
{
 "questionText": type: "String",
 "topic": type: "String",
 "level": type: "String", enum: ["100", "200", "300", "400", "500" ],
 "department": type: "String", uppercase: true,
 "weeks": type: Number, min: 1, max: 15,
 "semester": type: Number, enum: [1,2],
 "courseCode": type: "String", uppercase: true,
 "options": [
   text: {type: "String"}, label: {type: "String", enum: ["A", "B", "C", "D"]},
 ],
 "correctOption": type: "String", enum: ["A", "B", "C", "D"],
 "explanation": type: "String"
}
```

## 2 .

```js
// Example json data arrangement for each courseCode file in <../data/  >
// to be validated before seeding.
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

## Below are to be validated on number 2 style above 👆:

**Course level:**

- courseCode exist,
- department exist,
- level exist,

**Per week level:**

- semester exist, and it is a number: either 1 or 2,
- week exist, btw 1 or 15,
- topic exist,
- exactly 100 questions per week,

**Question level:**

- questionText exist,
- options is an array of 4 items,
- every option has label and text,
- all labels are exactly: "A", "B", "C", "D": no duplicate, no missing
- correct option value is one of the label's
- explanation exist

## once you are done validating:

- The next step is to seed
- In your seed file, flatten the jsons in <../data/ >
- then proceed to seeding
- good luck 🫠
