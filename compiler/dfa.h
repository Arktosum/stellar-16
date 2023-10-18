#pragma once
#include <string>
#include <map>
#include <unordered_set>
#include <iostream>
class DFA{
    public:
    int initialState;
    std::unordered_set<int> accepted_states;
    std::map<std::pair<int,char>,int> transition_table;
    bool isAccepted(const std::string input){
        int current_state = initialState;
        for(char c : input){
            if(transition_table.find({current_state,c}) == transition_table.end()){
                // Not processed go to a Dead state
                return false;
            }
            current_state = transition_table[{current_state,c}];
        }
        return accepted_states.find(current_state) != accepted_states.end();
    }
    private:
};

bool isDigit(const std::string input){
    DFA dfa;
    dfa.initialState = 0;
    dfa.accepted_states = {1};
    for(char i = '0'; i < '9' ; i++){
        dfa.transition_table[{0,i}] = 1;
        dfa.transition_table[{1,i}] = 1;
    }
    return dfa.isAccepted(input);
}

bool isString(const std::string input){
    DFA dfa;
    dfa.initialState = 0;
    dfa.accepted_states = {1};
    for(char i = 'a'; i < 'z' ; i++){
        dfa.transition_table[{0,i}] = 1;
        dfa.transition_table[{1,i}] = 1;
    }
    for(char i = 'A'; i < 'Z' ; i++){
        dfa.transition_table[{0,i}] = 1;
        dfa.transition_table[{1,i}] = 1;
    }
    return dfa.isAccepted(input);
}