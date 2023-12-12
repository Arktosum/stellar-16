#include <string>
#include <vector>
#include "dfa.h"
#include "tokenizer.h"
/*
Keywords:  if, else, while, class
Identifiers: variables, functions, classes, etc. They usually consist of a sequence of letters, digits, and underscores.
Operators:  (+, -, *, /), assignment operators (=, +=, -=, *=, /=), logical operators (&&, ||, !),
Literals:  numeric literals (integer or float values) and string literals.
Punctuation:  ((), []), braces ({}), commas, semicolons
Comments: //, /*
Whitespace:(spaces, tabs, newlines) // discarded
Special Symbols:  @  ::
*/



std::string c_str(char c){
    return std::string(1,c);
}
std::string peek(std::string &src)
{
    return c_str(src.at(0));
}
std::string eat(std::string &src)
{
    std::string c = peek(src);
    src = src.substr(1);
    return c;
}

std::vector<Token> tokenize(std::string src)
{
    std::vector<Token> tokens;
    while (src.length() > 0)
    {
        // Single character tokens
        bool singleFlag = true;
        std::string c = peek(src);
        switch (c[0])
        {
        case ' ':
        case '\n':
        case '\t': // We do not care about whitespace for now.
        case '\r':
            eat(src);
            break;
        case '+':
        case '-':
        case '*':
        case '/':
        case '%':
            tokens.push_back(Token{TokenType::BinaryOperator, eat(src)});
            break;
        case '(':
            tokens.push_back(Token{TokenType::openParanthesis, eat(src)});
            break;
        case ')':
            tokens.push_back(Token{TokenType::closedParanthesis, eat(src) });
            break;
        case '{':
            tokens.push_back(Token{TokenType::openCurlyBracket, eat(src)});
            break;
        case '}':
            tokens.push_back(Token{TokenType::closedCurlyBracket, eat(src) });
            break;
        case '[':
            tokens.push_back(Token{TokenType::openSquareBracket, eat(src)});
            break;
        case ']':
            tokens.push_back(Token{TokenType::closedSquareBracket, eat(src)});
            break;
        case '=':
            tokens.push_back(Token{TokenType::AssignmentOperator, eat(src) });
            break;
        default:
            singleFlag = !singleFlag;
        }
        if (singleFlag)
            continue;
        // Multi character token
        if (isDigit(c))
        {
            std::string buffer;
            while (src.length() > 0 && isDigit(peek(src) + ""))
            {
                buffer += eat(src);
            }
            tokens.push_back(Token{TokenType::NumericLiteral, buffer});
        }
        else if (isString(c + ""))
        {
            std::string buffer;
            while (src.length() > 0 && isString(peek(src) + ""))
            {
                buffer += eat(src);
            }
            tokens.push_back(Token{TokenType::Identifier, buffer});
        }
    }

    return tokens;
}