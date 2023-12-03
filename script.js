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
        <div class="movements__value">${mov.toFixed(2)}€</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance.toFixed(2)}€`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes.toFixed(2)}€`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out).toFixed(2)}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
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

  const amount = Math.floor(+inputLoanAmount.value);

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

// // And so now let's start learning a little bit about numbers.
// // And the first thing that you should know about numbers
// // is that in JavaScript,
// // all numbers are presented internally
// // as floating point numbers.
// // So basically, always as decimals,
// // no matter if we actually write them
// // as integers or as decimals.

// console.log(23 === 23.0);

// // And that's the reason why we only have one data type
// // for all numbers.

// // Also, numbers are represented internally
// // in a 64 base 2 format.
// // So that means that numbers are always stored
// // in a binary format.
// // So basically, they're only composed of zeros and ones.

// // Base 10 - 0 to 9
// console.log(1 / 10);
// console.log(3 / 10);

// // Bninary Base 2 - 0 to 1
// console.log(0.1 + 0.2);

// // And so in binary, the same thing happens with 0.1.
// // So we get basically an infinite fraction
// // and that then results in a weird result like this one.
// // Now, in some cases, JavaScript does some rounding
// // behind the scenes to try its best
// // to hide these problems
// // but some operations, such as this one,
// // simply cannot mask the fact
// // that behind the scenes,
// // they cannot represent certain fractions.

// // And by the way, many other languages use the same system.
// // For example, PHP or Ruby
// // and so don't let anyone make fun of JavaScript
// // because of this,

// // So we just have to accept that it works this way
// // because we really cannot do anything against this.
// // So just be aware
// // that you cannot do like really precise scientific
// // or financial calculations in JavaScript
// // because eventually, you will run into a problem like this.
// // So .2, which will result in false
// console.log(0.1 + 0.2 === 0.3);

// // o we know how to convert a string to a number, right?
// // So that's like this.
// console.log(Number(23));

// // But there's also an easier way.
// // So kind of a trick that we can use,
// // which is to, or actually this should be a string,
// // otherwise that doesn't make much sense.
// // But as I was saying,
// // there is an easier way,
// // which is simply plus 23 the string.
// // And this works
// // because when JavaScript sees the plus operator,
// // it will do type coercion.
// // So it will automatically convert all
// // the operands to numbers.
// // And so therefore, we see 23 here in both these cases.
// // So in this purple color, which are numbers.
// // So this here makes our code look a lot cleaner
// // in my opinion
// console.log(+'23');

// //Parsing

// // But we can also do something called parsing.
// // So we can parse a number from a string.
// // So on the Number object,
// // which is kind of this function here,
// // but it's also an object in the end.
// // Remember because every function is also an object.
// // And this number object here
// // has some methods to do parsing.

// //Parse integer
// console.log(Number.parseInt('30px'));

// // Now, in order to make this work,
// // the string needs to start with a number.

// // So if we have something like this,
// // then it's not gonna work
// // and we get not a number.
// console.log(Number.parseInt('e30'));

// // So this is a little bit like type coercion
// // but even more advanced
// // because as we just saw,
// // it tries to get rid of unnecessary symbols
// // that are not numbers.

// // And this can be very useful, for example,
// // in this situation where we get some kind of unit from CSS
// // and then need to get rid of that unit.
// // Now, the parseInt function

// // actually accepts a second argument,
// // which is the so-called regex.
// // And the regex is the base of the numeral system
// // that we are using.
// // So here we are simply using base 10 numbers.
// // So numbers from zero to nine.
// // And most of the time, we are doing that
// // and so we should always pass in the number 10 here.
// // Okay, so that can avoid some bugs in some situations.
// // And you see the result here is the same.

// console.log(Number.parseInt('30px', 10)); //base 10
// console.log(Number.parseInt('30px', 2)); //base 2

// //parse float
// console.log(Number.parseInt('2.5rem'));
// console.log(Number.parseFloat('2.5rem'));

// // we could even have like some white space down here
// // that would not affect anything at all.
// // All right?
// // Now, by the way, these two functions here
// // are actually also so-called global functions.
// // So we would not have to call them on Number.
// // So this here also works.

// // Okay, but this is the more traditional
// // and old-school way of doing it.
// console.log(parseFloat('2.5rem'));

// // Now in modern JavaScript,
// // it is more encouraged to call these functions
// // actually on the Number object, okay?
// // So we say that Number here provides something
// // called a namespace, all right?
// // So a namespace for all these different functions,
// // like parseFloat, and parseInt.
// // But any

// //Check if value is not a number NAN
// console.log(Number.isNaN(20));
// console.log(Number.isNaN('20'));
// console.log(Number.isNaN(+'20x'));
// console.log(Number.isNaN(23 / 0));

// // And so this is not a number
// // is actually not a perfect way
// // for checking if a value is a number
// // because it doesn't consider this use case
// // and sometimes, this might very well happen.

// // And therefore, there is a better method called isFinite.
// // And so this is actually better to check
// // if something is a number or not.
// // And I know this sounds a bit confusing,
// // and the confusion comes from the fact
// // that we have this weird thing here
// // that is also called not a number NAN
// //Checaking if value is a number
// console.log(Number.isFinite(20));
// console.log(Number.isFinite('20'));
// console.log(Number.isFinite(+'20x'));
// console.log(Number.isFinite(23 / 0));

// // o isFinite and so infinity is, of course, not finite.All right?
// // And so this method is the ultimate method
// // that you should use to check if any value is a number,
// // at least when you're working with floating point numbers.

// // So if you are sure
// // that you just need to check for an integer,
// // then you can use isInteger as well.
// // So let me just write here a comment as well.
// // So this one you should only use
// // to check if value is not a number.
// // So literally, not a number this value.

// console.log(Number.isInteger(23));
// console.log(Number.isInteger(23.0));
// console.log(Number.isInteger(23 / 0));

////////////////////////////////////////////////////////////////
// Math and Rounding
////////////////////////////////////////////////////////////////

// // Let's now learn
// // about some more mathematical operations
// // and also about rounding numbers.
// // And we have already been using
// // lots of mathematical operations,

// // for example plus, minus, times, divided,
// // exponentiation and so on.
// // And so we don't need to go over these again.

// // So let's start here with the square root.
// // And so just like many other functions
// // the square root is part of the math namespace.
// // So Math.sqrt, so this stands for square root.
// console.log(Math.sqrt(25));
// // And so all we need to do, is to pass in the number
// // and then it will give us the square root.
// // And the same could be achieved
// // using the exponentiation operator as well
// // by doing one divided by two.
// // And so that two is the square.
// // So we want the square root.
// // So we use one divided by two,
// // and actually we have to put this into parenthesis
// // and now it works, all right?
// console.log(25 ** (1 / 2));

// // And the same would work for a cubic root
// // for example of eight, which would be two.
// // And so actually this is I think the only way
// // you could calculate a cubic root if you need it.
// console.log(8 ** (1 / 3));

// console.log(Math.max(5, 18, 23, 11, 2));
// console.log(Math.max(5, 18, '23', 11, 2));
// console.log(Math.max(5, 18, '23px', 11, 2));

// console.log(Math.min(5, 18, '23px', 11, 2));
// console.log(Math.min(5, 18, 23, 11, 2));

// // if we wanted to calculate the radius of a circle
// // with 10 pixels, we could do that.
// console.log(Math.PI * Number.parseFloat('10px') ** 2);

// console.log(Math.trunc(Math.random() * 6) + 1);

// const randomInt = (min, max) =>
//   Math.trunc(Math.random() * (max - min) + 1) + min;
// // 0...1 -> 0...(max - min) -> min...max
// console.log(randomInt(10, 20));

// //Rounding integers
// // So again, this one simply removes any decimal part always,
// console.log(Math.trunc(23.3));

// // ut we have also other ways.
// // So we also have round, so math.round.
// // And so this one will always round to the nearest integer.
// console.log(Math.round(23.3));
// console.log(Math.round(23.9));

// console.log(Math.ceil(23.3));
// console.log(Math.ceil(23.9));

// console.log(Math.floor(23.3));
// console.log(Math.floor(23.9));

// // And by the way, all of these methods,
// // they also do type coercion.

// // So basically floor and trunc, both cut off the decimal part
// // when we are dealing with positive numbers.
// console.log(Math.trunc(23.3));

// // However, for negative numbers, it doesn't work this way.
// // but floor now gets rounded to minus 24.
// // Because with negative numbers,
// // rounding works the other way around.
// // And so actually a floor is a little bit better than trunc
// // because it works in all situations,
// // // no matter if we're dealing with positive
// // or negative numbers.
// console.log(Math.trunc(-23.3));
// console.log(Math.floor(-23.3)); //Because with negative numbers, rounding works the other way around.

// const randomInt2 = (min, max) =>
//   Math.floor(Math.random() * (max - min) + 1) + min;
// // 0...1 -> 0...(max - min) -> min...max
// console.log(randomInt2(10, 20));

// /// Rounding decimals

// // So with decimals it works differently
// // than with integers and debts.
// // Once again, because things in JavaScript
// // evolved kind of in a weird way in this kind of old language.
// // And if the language was designed today
// // and definitely this would be very different
// // but now this is what we have to work with right now, okay?
// console.log((2.7).toFixed(0)); // always return to string
// console.log((2.7).toFixed(3)); // always return to string
// console.log((2.345).toFixed(2)); // always return to string

// console.log(+(2.345).toFixed(2)); // to convert a number

// // Does this here works
// // in a similar way than the string methods?
// // So this is a number, so it's a primitive, right?
// // And primitives actually don't have methods.
// // And so behind the scenes, JavaScript will do boxing.
// // And boxing is to basically transform this
// // to a number object, then call the method on that object.
// // And then once the operation is finished
// // it will convert it back to a primitive, okay?

//////////////////////////////////////////////////////////////
// The Remainder Operator
//////////////////////////////////////////////////////////////

// console.log(5 % 2);
// console.log(5 / 2); //5  = 2 * 2 + 1

// console.log(8 % 3);
// console.log(8 / 3); //8  = 2 * 3 + 2

// //reminder
// console.log(6 % 2);
// console.log(6 / 2);

// const isEven = n => n % 2 === 0;
// console.log(isEven(8));
// console.log(isEven(23));
// console.log(isEven(514));

// labelBalance.addEventListener('click', function () {
//   [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
//     //every 2nd row
//     if (i % 2 === 0) row.style.backgroundColor = 'orangered';

//     //every 3rd row
//     if (i % 3 === 0) row.style.backgroundColor = 'blue';
//   });
// });

//////////////////////////////////////////////////////////////////
// Numeric Separators
//////////////////////////////////////////////////////////////////

// // Starting from year's 2021.
// // We can use a feature called "Numeric Separators"
// // to format numbers in a way
// // that is easier for us,
// // or for other developers to read and to understand.

// // Let's say that we wanted to represent
// // a really large number.
// // For example, the diameter of our solar system.
// // Let's say a diameter,
// // which is 287,460,000,000.
// // And just from looking at this number here,
// // it's really difficult to read and to understand it.
// // Does this mean like 28 billion or is it just 2 billion
// // or really what is this number?
// // It's really hard to read like this.
// // There is just too many zeros here.
// // Now to help with this,
// // when we write a number this large
// // under normal English language,
// // we usually use a thousand separator like the comma.
// // We would write this number like this.
// // And then it becomes really easy
// // to immediately see that this means 287,460,000,000.

// // And now, fortunately,
// // we can do the same thing in JavaScript as well,
// // using the new numeric separators.

// // 287, 460, 000, 000
// const diameter = 287_460_000_000;

// // Numeric separators are simply underscores
// // that we can place anywhere that we want in
// // or numbers,
// // and which will make it really easy to understand
// // and to parse numbers this large.
// // Using the underscore here as a thousand separator,
// // then makes it really easy to understand,
// // that this number here
// // means in fact, 287 billion.

// // Now let's just log it to the console
// // to see what JavaScript actually sees.
// // And so here we see that in fact,
// // the engine basically ignores these underscores.
// // So these numeric separators.
// // It simply sees the number itself.
// // And so what this means,
// // is that we can actually place the underscores,
// // the numeric separators, anywhere that we want.
// console.log(diameter);

// const price = 345_99;
// console.log(price);

// const transferFee1 = 15_00;
// const transferFee2 = 1_500;

// // And this one is to show you some restrictions
// // as to where we can place the underscore.
// // PI is,
// // 3.1415,
// // and we can only place underscores between numbers.

// const PI = 3.1415;
// console.log(PI);

// // And now just one final detail that we need to be aware of
// // is that when we try to convert strings,
// // that contain underscores,
// // to a number that will not work as expected.

// console.log(Number('230000'));

// // However, if we place an underscore here,
// // so if we want to have a numeric separator here,
// // that would not work.
// // Now it is not a number.
// // What that means,
// // is that you should really only use,
// // these numeric separators,
// // when you are writing down numbers like this.

// // Really in the code.
// console.log(Number('230_000'));

// // f you need to store a number in a string,
// // for example, in an API,
// // or if you get a number as a string from an API,
// // you should not use underscores in there,
// // because then JavaScript will not be able
// // to parse the number correctly out of that string.
// // It's not gonna work as expected
// // and you will get it's not a number,
// // that might then introduce bugs into your application.

// console.log(parseInt('230_000'));
// // And the same is true with the "parseInt" function.
// // Here we do not get not a number,
// // but we only get to 230.
// // Only the parts that is here in front of the underscore.
// // Everything else will then be ignored.

////////////////////////////////////////////////////////////////////
// Working with BigInt
////////////////////////////////////////////////////////////////////

// Let's now meet one of the primitive data types,
// that we never talked about before
// and that is BigInt.
// So big and is a special type of integers
// that was introduced in year 2020
// and so let's quickly take a look at it.
// So we learned in the first lecture of the section
// that numbers are represented internally as 64 bits.
// And that means that there are exactly 64 ones or zeros
// to represent any given number.
// Now of these 64 bits only 53 are used
// to actually store the digits themselves.
// The rest are for storing the position
// of the decimal point and the sign.
// Now, if there are only 53 bits to store the number,
// that means that there is a limit
// of how big numbers can be,
// and we can calculate that number.
// So that's two elevated to 53
// and then minus one, because the numbers starts at zero.
// And so that is this gigantic number right here.
// And so this is essentially the biggest number
// that JavaScript can safely represent, okay.
// Or actually is 53.
// So this is the biggest number, alright.
// And it is two,
// because again we are working with base two,

console.log(2 ** 53 - 1);

// So any integer that is larger than this, is not safe
// and that means it cannot be
console.log(Number.MAX_SAFE_INTEGER);

// It only added one number
// to this one where it should have been added two.
// So if we do this, then we get the exact same thing.
// So we keep adding numbers here
// and they are always the same.
// And so that means that JavaScript can
// simply not represent these numbers accurately.
// And so if we do calculations with numbers
// that are bigger than this,
// then we might lose precision, okay.

// So in some numbers it does actually work
// for some reason, but that's because JavaScript
// behind the scenes uses some tricks
// to still represent some of the unsafe numbers.
// But again, sometimes that works,
// sometimes it doesn't.
// And so that's why we call these unsafe numbers.
// So you'll see sometimes these numbers are
// or at least look correct.
// And sometimes they don't, okay.
console.log(2 ** 53 + 1);
console.log(2 ** 53 + 2);
console.log(2 ** 53 + 3);
console.log(2 ** 53 + 4);

// So, this can be a problem sometimes
// because in some situations
// we might need really, really big numbers.
// Way bigger than this one here
// for example, for database IDs
// or when interacting with real 60 bit numbers
// and these numbers are actually used in other languages.
// And so we might, for example
// from some API, get a number that is larger than this.
// And then we have no way
// of storing that in JavaScript,

//===========
// at least not until now,
// because now starting from IES 2020
// a new primitive was added,
// which is called BigInt.

// Now right? And BigInt stands for big integer.
// And it can be used to store numbers as large as we want.
// So no matter how big, all right.
// So let's say we need this number
// and I'm just using random numbers here.
// So if I lock this,
// then you'll see well this here
// which probably does not have precision
// because of course it's larger than this,
// but if I use the n, then this will be a BigInt.
// So let's see that.
console.log(48796456465465789879786213132513646798764346987897);

// but if I use the n, then this will be a BigInt.
// So let's see that.
// And so this n here basically transforms a regular number,
// into a BigInt number.
// And you see in the console here,
// it then also does look different. Okay?
console.log(48796456465465789879786213132513646798764346987897n);

// We can also create BigInt by using the BigInt function.
// So sometimes that's necessary
// and then without the n.
// And so this gives us kind of the same result,
// while not really, for some reason,
// but I guess it is because JavaScript will first have
// to still represent this number here internally,
// before it can then transform it into a BigInt.
// And that's the reason why here
// from a certain point on this second number is different.
console.log(BigInt(48796456465465789879786213132513646798764346987897));

// So this constructor function should probably only be used
// with small numbers,
// for example, like this.
// Now, okay.
console.log(BigInt(48796));

// Operations

// And well, basically it's very simple.
// All the usual operators still work the same.
console.log(10000n + 10000n);
console.log(1000045646461498797987987946464679876945646n * 5486456465646546n);

// Now what is not possible is
// to mix BigInt with regular numbers.
const huge = 526465465465465134646465n;
const num = 23;

// cannot mix BigInt and other types.
// console.log(huge * num);

// And this is where the constructor function
console.log(huge * BigInt(num));

// However, there are two exceptions to this
// which are the comparison operators
// and the plus operator when working with strings.

// So let's see that.
// So we can still do a BigInt,
// and then for example, a greater than a normal number.
// So this still works
// and we still get true as expected, okay.

//Exceptions
console.log(20n > 15);

// However, when we do this
// so 20n equal, equal, equal 20,
// we will get false.
// But that makes sense
// because JavaScript when we use the triple operator
// does not do type coercion.
// And in fact,these two values here,

// they have a different primitive type.
// This is a regular number, and this is a BigInt.
// In fact, we can check that,
// Or at least I think we can,
// I never did this actually.
// But yeah, indeed the type of this is a BigInt,
// All right.

console.log(20n === 20);
console.log(typeof 20n);

// But however, if we do the regular equality operator,
// so the lose one,
// then this should still be true.
// Right. Because then JavaScript does the type coercion.
// And so then it will coerce this one to a regular number,
// and then they're both the same.

console.log(20n == 20);

// And so then it will coerce this one to a regular number,
// and then they're both the same.
// So just like, so it would even work like this.
console.log(20n == '20');

//String exception
// And the other exception is when
// we do string concatenations.

// And so you'll see in this case,
// the number isn't actually converted to a string.
// So even the BigInt number, okay.
console.log(huge + ' is REALLY big!!!');

// Now, one other thing that I didn't tell you up here is
// that also the math operations that we talked
// about earlier are not gonna work here.
// So that doesn't work.
// console.log(Math.sqrt(16n));

//Division exception

// this would not be an integer, right?
// So 10 divided by three is 3.33 until infinity.
// So here, but with BigInt,
// it will simply then return the closest BigInt. Right?
// Let's try it with 11 here,
// and so it simply basically cuts the decimal part off,
// of course with 12, it would then be four, right.
// But with anything else,
// it will then cut off the decimal part, okay.
console.log(10n / 3n);
console.log(11n / 3n);
console.log(12n / 3n);
console.log(10 / 3);

// And basically, this is all that I have to tell you
// in an introduction video like this one about BigInt.
// So this new primitive type
// adds some new capabilities
// to the JavaScript language.
// When you really need to work with like huge numbers
// just like this one here, for example.

// Now in practice, you will probably not use this very much
// but it's still good to know that BigInt exists
// and also how it works.
