Vue.component('todo-item', {
    template: '\
<li>\
{{ title }}\
<button v-on:click="$emit(\'remove\')">Delete</button>\
</li>\
',
    props: ['title']
});

Vue.component('columns', {
    template: `
        <div class="columns">
            <column title="New" :cards="newColumn" @add-card="addCard('newColumn', $event)" @remove-card="removeCard('newColumn', $event)" ></column>
            <column title="In process" :cards="inProgressColumn" @remove-card="removeCard('inProgressColumn', $event)" ></column>
            <column title="Done" :cards="completedColumn" @remove-card="removeCard('completedColumn', $event)" @></column>
        </div>
        `,
    data() {
        return {
            newColumn: [],
            inProgressColumn: [],
            completedColumn: [],
            maxCards: {
                newColumn: 3,
                inProgressColumn: 5,
                completedColumn: Infinity
            }
        }
    },
    created() {
        this.loadFromLocalStorage();
    },
    methods: {
        addCard(column, customTitle) {
            const totalCards = this.newColumn.length + this.inProgressColumn.length + this.completedColumn.length;
            if (totalCards >= this.maxCards.newColumn + this.maxCards.inProgressColumn + this.maxCards.completedColumn) {
                alert(`Достигнуто максимальное количество карточек во всех столбцах.`);
                return;
            }
            if (this[column].length >= this.maxCards[column]) {
                alert(`Достигнуто максимальное количество карточек в столбце "${this.getColumnTitle(column)}".`);
                return;
            }
            if (column !== 'newColumn') {
                alert(`Можно добавлять заметки только в столбец "New".`);
                return;
            }
            const newCard = {
                title: customTitle || 'New note',
                items: [
                    { text: '', completed: false, editing: true },
                    { text: '', completed: false, editing: true },
                    { text: '', completed: false, editing: true }
                ],
                status: 'New'
            };
            this[column].push(newCard);

        getColumnTitle(column) {
            switch (column) {
                case 'newColumn':
                    return 'New';
                case 'inProgressColumn':
                    return 'In process';
                case 'completedColumn':
                    return 'Done';
                default:
                    return '';
            }
        }
    }
});

Vue.component('column', {
    props: ['title', 'cards'],
    template: `
        <div class="column">
      <h2>{{ title }}</h2>
<!--      Свойство карточки:-->
      <card v-for="(card, index) in cards" :key="index" :card="card" @delete-card="deleteCard(index)"  @move-card-to-in-progress="moveCardToInProgress" @move-card-to-completed="moveCardToCompleted"></card>
      <form action="" v-if="title === 'New'">
        <input type="text" v-model="customTitle">
        <button v-if="title === 'New'" @click="addCardWithCustomTitle">Добавить заметку</button>
      </form>
      </div>
        `,
    methods: {
        removeCard(cardIndex) {
            this.$emit('remove-card', cardIndex);
        },
        addCardWithCustomTitle() {
            const customTitle = prompt('Введите заголовок для новой заметки:');
            if (customTitle) {
                this.$emit('add-card', customTitle);
            }
        },

    }
});

Vue.component('card', {
    props: ['card'],
    template: `
        <div class="card">
            <h3>{{ card.title }}</h3>
            <ul>
                <li v-for="(item, index) in card.items" :key="index">
                    <input type="text" v-model="item.text" :disabled="!item.editing">
                    <input type="checkbox" v-model="item.completed" @change=>
                    <button class="btn" @click="saveItem(index)" v-if="item.editing">Save</button>
                    <button class="btn" @click="editItem(index)" v-else>Refactor</button>
                    <button class="btn" @click="removeItem(index)">Delete</button>
                </li>
                <li v-if="card.items.length < 5 && card.status !== 'Done'">
                    <button class="btn" @click="addItem">Add point</button>
                </li>
            </ul>
            <button class="btn" v-if="card.status !== 'Done'" @click="removeCard">Delete note</button>
            <p v-if="card.status === 'Done'">Дата завершения: {{ card.completionDate }}</p>
        </div>
        `,
    methods: {


});

new Vue({
    el: '#app',
    data() {
        return {
            newColumn: [],
            inProgressColumn: [],
            completedColumn: [],
        }
    },

    methods: {


});
