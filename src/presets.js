export const presets = {
  lexicographical: {
    name: "Lexicographical Order",
    code: `function lexi(n) {
    const result = [];
    let curr = 1;

    for (let i = 0; i < n; i++) {
        result.push(curr);

        if (curr * 10 <= n) {
            curr *= 10;
        } else {
            while (curr % 10 === 9 || curr + 1 > n) {
                curr = Math.floor(curr / 10);
            }
            curr++;
        }
    }

    return result;
}
lexi(13);`
  },
  bubbleSort: {
    name: "Bubble Sort",
    code: `function bubbleSort(arr) {
    let n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j+1]) {
                let temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;
            }
        }
    }
    return arr;
}
let data = [5, 3, 8, 4, 1, 9, 2];
bubbleSort(data);`
  },
  findMax: {
    name: "Find Max in Array",
    code: `function findMax(arr) {
    let max = arr[0];
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            max = arr[i];
        }
    }
    return max;
}
let nums = [12, 45, 7, 89, 23];
findMax(nums);`
  },
  stackDemo: {
    name: "Stack Push/Pop Demo",
    code: `function stackOperations() {
    let stack = [];
    stack.push(10);
    stack.push(20);
    stack.push(30);
    let top = stack.pop();
    stack.push(40);
    return stack;
}
stackOperations();`
  }
};
