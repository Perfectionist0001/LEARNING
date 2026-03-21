#include<bits/stdc++.h>
using namespace std;

int maxx(int num1, int num2) {
    if(num1 > num2){
        return num1;
    }
    else{
        return num2;
    }
}

int minn(int num1, int num2) {
    if(num1 < num2){
        return num1;
    }
    else{
        return num2;
    }
}

int main(){
    int num1, num2;
    cout << "Enter two numbers: ";
    cin >> num1 >> num2;

    int maximum = maxx(num1, num2);
    int minimum = minn(num1, num2);

    cout << "Maximum: " << maximum << endl;
    cout << "Minimum: " << minimum << endl;

    return 0;
}
