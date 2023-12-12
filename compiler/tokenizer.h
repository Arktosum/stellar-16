#pragma once
#include <string>
#include <vector>

enum TokenType
{
    Keyword,
    Identifier,
    NumericLiteral,
    BinaryOperator,
    AssignmentOperator,
    UnaryOperator,
    Literal,
    openParanthesis,     // (
    closedParanthesis,   // )
    openSquareBracket,   // [
    closedSquareBracket, // ]
    openCurlyBracket,    // {
    closedCurlyBracket,  // }
    Comment,             //
    Whitespace,
    Special
};
struct Token
{
    TokenType type;
    std::string value;
};

std::string c_str(char c);
std::string peek(std::string &src);
std::string eat(std::string &src);
std::vector<Token> tokenize(std::string src);