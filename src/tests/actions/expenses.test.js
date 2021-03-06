import {
    startAddExpense,
    addExpense, 
    editExpense, 
    removeExpense,
    setExpenses,
    startSetExpenses, 
    startRemoveExpense,
    startEditExpense
} from '../../actions/expenses';
import expenses from '../fixtures/expenses';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import database from '../../firebase/firebase';

const uid = 'thisismytestuid';
const createMockStore = configureMockStore([thunk])// very important dont forget


beforeEach((done) =>{

    const expensesData = {};
    expenses.forEach(({id,description,note,amount,createdAt})=>{
        expensesData[id] = {description,note,amount,createdAt}
    })
    database.ref(`users/${uid}/expenses`).set(expensesData).then(()=>done());
})

test ('should setup remove expense action object', ()=>{
    const action = removeExpense({id:'123abc'});
    expect(action).toEqual({
        type: 'REMOVE_EXPENSE',
        id:'123abc'
    })
})

test('should remove expenses from the firebase',(done)=>{
    const store = createMockStore({ auth:{uid} });//before we dont have any arguments here, but now we do need the uid to be put into mock store
    const id = expenses[0].id;
    store.dispatch(startRemoveExpense({id})).then(()=>{
        const actions = store.getActions();
        expect(actions[0]).toEqual({
            type:'REMOVE_EXPENSE',
            id
        });
        return database.ref(`users/${uid}/expenses/${id}`).once('value');
    }).then((snapshot)=>{
        expect(snapshot.val()).toBeFalsy();
        done();
    })
  
})

test("should setup edit expense action object",()=>{
    const action = editExpense('123abc',{note:'New note value'});
    expect(action).toEqual({
        type:'EDIT_EXPENSE',
        id:'123abc',
        updates: {
            note: 'New note value'
        } 
    })
})

test("should edit expense data in the firebase",(done)=>{
    const store = createMockStore({ auth:{uid} });
    const id = expenses[1].id
    const updates= {
        description:'testingchange',
        amount:3000,
        note:'This one is better',
        createdAt:1000
    }
    store.dispatch(startEditExpense(id,updates)).then(()=>{
        const actions = store.getActions();
        expect(actions[0]).toEqual({
            type:'EDIT_EXPENSE',
            id,
            updates
        });
        return database.ref(`users/${uid}/expenses/${id}`).once('value');
    }).then((snapshot)=>{
        expect(snapshot.val()).toEqual(updates);
        done();
    })
})

test('should setup add expense action object with provided value', ()=>{
    const action = addExpense(expenses[2]);
    expect(action).toEqual({
        type:'ADD_EXPENSE',
        expense:expenses[2]
    })
});

test('should add expense to database and store',(done)=>{
    //mockstore is used to connect redux-store,so that we can use dispatch
    const store = createMockStore({auth:{uid}});
    const expenseData = {
        description:'Mouse',
        amount:3000,
        note:'This one is better',
        createdAt:1000
    }
    store.dispatch(startAddExpense(expenseData)).then(()=>{
        const actions = store.getActions();
        expect(actions[0]).toEqual({
            type:'ADD_EXPENSE',
            expense:{
                id:expect.any(String),
                ...expenseData
            }
        });

        return database.ref(`users/${uid}/expenses/${actions[0].expense.id}`).once('value')
        // done here means the test is not going to consider succ or fail
        // until the done() here. so all the code is before done();
        // all code will run first and then check if it was success or fail
        }).then((snapshot)=>{
        expect(snapshot.val()).toEqual(expenseData);
        done();
    });
})

test('should add expense with default to database and store',(done)=>{
    const store = createMockStore({auth:{uid}});
    const expenseDataDefaults = {
        description:'',
        amount:0,
        note:'',
        createdAt:0
    }
    store.dispatch(startAddExpense({})).then(()=>{
        const actions = store.getActions();
        expect(actions[0]).toEqual({
            type:'ADD_EXPENSE',
            expense:{
                id:expect.any(String),
                ...expenseDataDefaults
            }
        });

        return database.ref(`users/${uid}/expenses/${actions[0].expense.id}`).once('value')
        // done here means the test is not going to consider succ or fail
        // until the done() here. so all the code is before done();
        // all code will run first and then check if it was success or fail
        }).then((snapshot)=>{
        expect(snapshot.val()).toEqual(expenseDataDefaults);
        done();
    });
})

test('should setup set expense action object with data',()=>{
    const action = setExpenses(expenses);
    expect(action).toEqual({
        type:'SET_EXPENSES',
        expenses
    })
})

test('should fetch the expenses from the firebase',(done)=>{
    const store = createMockStore({auth:{uid}});
    store.dispatch(startSetExpenses()).then(()=>{
        const actions = store.getActions();
        expect(actions[0]).toEqual({
            type:'SET_EXPENSES',
            expenses
        });
        done();
    })

});

