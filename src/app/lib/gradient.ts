/* eslint-disable @typescript-eslint/no-unused-vars */
const gradientPairs = [
    ['from-pink-500 to-orange-300', 'from-pink-600 to-orange-400'],
    ['from-purple-500 to-blue-300', 'from-purple-600 to-blue-400'],
    ['from-blue-500 to-green-300', 'from-blue-600 to-green-400'],
    ['from-yellow-500 to-red-300', 'from-yellow-600 to-red-400'],
    ['from-teal-500 to-blue-300', 'from-teal-600 to-blue-400'],
    ['from-indigo-500 to-purple-300', 'from-indigo-600 to-purple-400'],
  ];
  
  export function getRandomGradient(userId: string | number) {
    // Use userId to consistently get the same gradient for the same user
    let id = 1;
    console.log(userId)
    if(userId){
        id = typeof userId === 'string' ? Number(userId) : userId;
    }
    console.log(id)
    const index = (id-1)%5 + 1;
    console.log("Index:", index)
    return {
      normal: gradientPairs[index][0],
      hover: gradientPairs[index][1],
    };
  }  