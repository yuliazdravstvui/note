const note = new Vue({
    el: "#note",
    data: {
        column1: [
            {
                title: "Card 1",
                items: [
                    {text: "point 1", checked: false},
                    {text: "point 2", checked: false},
                    {text: "point 3", checked: false}
                ],
                percentComplete: 0,
                date: null
            }
        ],
        column2: [
            {
                title: "Card 2",
                items: [
                    {text: "point 1", checked: false},
                    {text: "point 2", checked: false},
                    {text: "point 3", checked: false},
                    {text: "point 4", checked: false},
                    {text: "point 5", checked: false}
                ],
                percentComplete: 0,
                date: null
            }
        ],
        column3: []
    }
});
