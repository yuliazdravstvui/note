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
            <column title="New" :cards="newColumn" @add-card="addCard('newColumn', $event)" @remove-card="removeCard('newColumn', $event)" @save-local-storage="saveToLocalStorage" @move-card-to-in-progress="moveCardToInProgress" @move-card-to-completed="moveCardToCompleted"></column>
            <column title="In process" :cards="inProgressColumn" @remove-card="removeCard('inProgressColumn', $event)" @save-local-storage="saveToLocalStorage" @move-card-to-in-progress="moveCardToInProgress" @move-card-to-completed="moveCardToCompleted" @lock-first-column="lockFirstColumn"></column>
            <column title="Done" :cards="completedColumn" @remove-card="removeCard('completedColumn', $event)" @save-local-storage="saveToLocalStorage"></column>
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
            this.saveToLocalStorage();
        },
        removeCard(column, cardIndex) {
            this[column].splice(cardIndex, 1);
            this.saveToLocalStorage();
        },
        saveToLocalStorage() {
            localStorage.setItem('todo-columns', JSON.stringify({
                newColumn: this.newColumn,
                inProgressColumn: this.inProgressColumn,
                completedColumn: this.completedColumn
            }));
        },
        loadFromLocalStorage() {
            const data = JSON.parse(localStorage.getItem('todo-columns'));
            if (data) {
                this.newColumn = data.newColumn || [];
                this.inProgressColumn = data.inProgressColumn || [];
                this.completedColumn = data.completedColumn || [];
                this.newColumn.forEach(card => card.items.forEach(item => item.completed = !!item.completed));
                this.inProgressColumn.forEach(card => card.items.forEach(item => item.completed = !!item.completed));
                this.completedColumn.forEach(card => card.items.forEach(item => item.completed = !!item.completed));
            }
        },
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
        },
        moveCardToInProgress(card) {
            const index = this.newColumn.indexOf(card);
            if (index !== -1) {
                if (this.inProgressColumn.length >= this.maxCards.inProgressColumn) {
                    alert('Столбец "In process" уже содержит максимальное количество карточек.');
                    return;
                }

                this.newColumn.splice(index, 1);
                this.inProgressColumn.push(card);
                this.saveToLocalStorage();
                if (this.inProgressColumn.length >= this.maxCards.inProgressColumn) {
                    this.lockFirstColumn();
                }
            }
        },
        moveCardToCompleted(card) {
            const index = this.inProgressColumn.indexOf(card);
            if (index !== -1) {
                this.inProgressColumn.splice(index, 1);
                this.completedColumn.push(card);
                this.saveToLocalStorage();
            }
        },
        lockFirstColumn() {
            this.isFirstColumnLocked = true;
        }
    },
});
Vue.component('column', {
    props: ['title', 'cards'],
    template: `
        <div class="column">
        <form action="" v-if="title === 'New'">
        <input type="text" v-model="customTitle">
        <button class="btn" v-if="title === 'New'" @click="addCardWithCustomTitle">Добавить заметку</button>
      </form>
      <h2>{{ title }}</h2>
       <card v-for="(card, index) in cards" :key="index" :card="card" @remove-card="removeCard(index)" @save-local-storage="saveToLocalStorage"  @move-card-to-in-progress="moveCardToInProgress" @move-card-to-completed="moveCardToCompleted"></card>
      
      </div>
        `,

    data() {
        return {
            customTitle: ''
        };
    },
    methods: {
        removeCard(cardIndex) {
            this.$emit('remove-card', cardIndex);
        },
        addCardWithCustomTitle() {
            const customTitle = prompt('Name a note:');
            if (customTitle) {
                this.$emit('add-card', customTitle);
            }
        },
        saveToLocalStorage() {
            this.$emit('save-local-storage');
            
        }
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
                    <input type="checkbox" v-model="item.completed" @change="saveToLocalStorage">
                    <button class="btn" @click="saveItem(index)" v-if="item.editing">Save</button>
                    <button class="btn" @click="editItem(index)" v-else>Refactor</button>
                    <button class="btn" @click="removeItem(index)">Delete</button>
                </li>
                <li v-if="card.items.length < 5 && card.status !== 'Done'">
                    <button class="btn" @click="addItem">Add point</button>
                </li>
            </ul>
            <button class="btn" v-if="card.status !== 'Done'" @click="removeCard">Delete note</button>
            <p v-if="card.status === 'Done'">Date of the end: {{ card.completionDate }}</p>
        </div>
        `,
    methods: {
        addItem() {
            if (this.card.items.length < 5) {
                this.card.items.push({ text: '', completed: false, editing: true });
                this.saveToLocalStorage();
            } else {
                alert('Max points');
            }
        },
        removeItem(index) {
            this.card.items.splice(index, 1);
            this.saveToLocalStorage();
        },
        removeCard() {
            this.$emit('remove-card');
        },
        saveItem(index) {
            this.card.items[index].editing = false;
            this.saveToLocalStorage();
        },
        editItem(index) {
            this.card.items[index].editing = true;
        },
        saveToLocalStorage() {
            this.checkCardStatus();
            this.$emit('save-local-storage');
        },
        checkCardStatus() {
            const completedItems = this.card.items.filter(item => item.completed).length;
            const totalItems = this.card.items.length;
            if (completedItems > 0 && completedItems === totalItems) {
                this.card.status = 'Done';
                this.card.completionDate = new Date().toLocaleString();
            } else if (completedItems > totalItems / 2) {
                this.card.status = 'In process';
            } else {
                this.card.status = 'New';
            }
        }
    }
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
    created() {
        this.loadFromLocalStorage();
    },
    methods: {
        removeCard(column, cardIndex) {
            this[column].splice(cardIndex, 1);
            this.saveToLocalStorage();
        },
        saveToLocalStorage() {
            localStorage.setItem('todo-columns', JSON.stringify({
                newColumn: this.newColumn,
                inProgressColumn: this.inProgressColumn,
                completedColumn: this.completedColumn
            }));
        },
        loadFromLocalStorage() {
            const data = JSON.parse(localStorage.getItem('todo-columns'));
            if (data) {
                this.newColumn = data.newColumn || [];
                this.inProgressColumn = data.inProgressColumn || [];
                this.completedColumn = data.completedColumn || [];
                // Установка состояния чекбоксов
                this.newColumn.forEach(card => card.items.forEach(item => item.completed = !!item.completed));
                this.inProgressColumn.forEach(card => card.items.forEach(item => item.completed = !!item.completed));
                this.completedColumn.forEach(card => card.items.forEach(item => item.completed = !!item.completed));
            }
        },
    }
});
