const arr = [1, 2, 3, 4, 5];

for (let i = 0; i < arr.length; i++) {
  if (arr[i] === 2) {
    arr.splice(i, 1);
    i--;
  }
}

console.log(arr);
