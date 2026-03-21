#include<bits/stdc++.h>
using namespace std;
int main(){
    int x;
    cout<<"Enter a number: ";
    cin >> x;
    if(x >= 18){
        cout<<"You are an adult."<<endl;
    }
    else{
        cout<<"You are a minor."<<endl;
    }
    return 0;
}