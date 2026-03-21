// Parametrised Function
#include <bits/stdc++.h>
using namespace std;
void sumof(int num1, int num2, int &num3) {
    num3 = num1 + num2;
}
int main() {
    int num1, num2, num3;
    cin >> num1 >> num2;
    sumof(num1, num2, num3);
    cout << num3;
    return 0;
}

