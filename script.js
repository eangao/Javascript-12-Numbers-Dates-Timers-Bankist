'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__value">${mov}€</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance}€`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes}€`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out)}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest}€`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc.movements);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = +inputLoanAmount.value;

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    currentAccount.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

////////////////////////////////////////////////
// Converting and Checking Numbers
////////////////////////////////////////////////

// And so now let's start learning a little bit about numbers.
// And the first thing that you should know about numbers
// is that in JavaScript,
// all numbers are presented internally
// as floating point numbers.
// So basically, always as decimals,
// no matter if we actually write them
// as integers or as decimals.

console.log(23 === 23.0);

// And that's the reason why we only have one data type
// for all numbers.

// Also, numbers are represented internally
// in a 64 base 2 format.
// So that means that numbers are always stored
// in a binary format.
// So basically, they're only composed of zeros and ones.

// Base 10 - 0 to 9
console.log(1 / 10);
console.log(3 / 10);

// Bninary Base 2 - 0 to 1
console.log(0.1 + 0.2);

// And so in binary, the same thing happens with 0.1.
// So we get basically an infinite fraction
// and that then results in a weird result like this one.
// Now, in some cases, JavaScript does some rounding
// behind the scenes to try its best
// to hide these problems
// but some operations, such as this one,
// simply cannot mask the fact
// that behind the scenes,
// they cannot represent certain fractions.

// And by the way, many other languages use the same system.
// For example, PHP or Ruby
// and so don't let anyone make fun of JavaScript
// because of this,

// So we just have to accept that it works this way
// because we really cannot do anything against this.
// So just be aware
// that you cannot do like really precise scientific
// or financial calculations in JavaScript
// because eventually, you will run into a problem like this.
// So .2, which will result in false
console.log(0.1 + 0.2 === 0.3);

// o we know how to convert a string to a number, right?
// So that's like this.
console.log(Number(23));

// But there's also an easier way.
// So kind of a trick that we can use,
// which is to, or actually this should be a string,
// otherwise that doesn't make much sense.
// But as I was saying,
// there is an easier way,
// which is simply plus 23 the string.
// And this works
// because when JavaScript sees the plus operator,
// it will do type coercion.
// So it will automatically convert all
// the operands to numbers.
// And so therefore, we see 23 here in both these cases.
// So in this purple color, which are numbers.
// So this here makes our code look a lot cleaner
// in my opinion
console.log(+'23');

//Parsing

// But we can also do something called parsing.
// So we can parse a number from a string.
// So on the Number object,
// which is kind of this function here,
// but it's also an object in the end.
// Remember because every function is also an object.
// And this number object here
// has some methods to do parsing.

//Parse integer
console.log(Number.parseInt('30px'));

// Now, in order to make this work,
// the string needs to start with a number.

// So if we have something like this,
// then it's not gonna work
// and we get not a number.
console.log(Number.parseInt('e30'));

// So this is a little bit like type coercion
// but even more advanced
// because as we just saw,
// it tries to get rid of unnecessary symbols
// that are not numbers.

// And this can be very useful, for example,
// in this situation where we get some kind of unit from CSS
// and then need to get rid of that unit.
// Now, the parseInt function

// actually accepts a second argument,
// which is the so-called regex.
// And the regex is the base of the numeral system
// that we are using.
// So here we are simply using base 10 numbers.
// So numbers from zero to nine.
// And most of the time, we are doing that
// and so we should always pass in the number 10 here.
// Okay, so that can avoid some bugs in some situations.
// And you see the result here is the same.

console.log(Number.parseInt('30px', 10)); //base 10
console.log(Number.parseInt('30px', 2)); //base 2

//parse float
console.log(Number.parseInt('2.5rem'));
console.log(Number.parseFloat('2.5rem'));

// we could even have like some white space down here
// that would not affect anything at all.
// All right?
// Now, by the way, these two functions here
// are actually also so-called global functions.
// So we would not have to call them on Number.
// So this here also works.

// Okay, but this is the more traditional
// and old-school way of doing it.
console.log(parseFloat('2.5rem'));

// Now in modern JavaScript,
// it is more encouraged to call these functions
// actually on the Number object, okay?
// So we say that Number here provides something
// called a namespace, all right?
// So a namespace for all these different functions,
// like parseFloat, and parseInt.
// But any

//Check if value is not a number NAN
console.log(Number.isNaN(20));
console.log(Number.isNaN('20'));
console.log(Number.isNaN(+'20x'));
console.log(Number.isNaN(23 / 0));

// And so this is not a number
// is actually not a perfect way
// for checking if a value is a number
// because it doesn't consider this use case
// and sometimes, this might very well happen.

// And therefore, there is a better method called isFinite.
// And so this is actually better to check
// if something is a number or not.
// And I know this sounds a bit confusing,
// and the confusion comes from the fact
// that we have this weird thing here
// that is also called not a number NAN
//Checaking if value is a number
console.log(Number.isFinite(20));
console.log(Number.isFinite('20'));
console.log(Number.isFinite(+'20x'));
console.log(Number.isFinite(23 / 0));

// o isFinite and so infinity is, of course, not finite.All right?
// And so this method is the ultimate method
// that you should use to check if any value is a number,
// at least when you're working with floating point numbers.

// So if you are sure
// that you just need to check for an integer,
// then you can use isInteger as well.
// So let me just write here a comment as well.
// So this one you should only use
// to check if value is not a number.
// So literally, not a number this value.

console.log(Number.isInteger(23));
console.log(Number.isInteger(23.0));
console.log(Number.isInteger(23 / 0));
