#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include "dfa.h"
std::string readFile(const std::string &filename)
{
    std::ifstream inputFile(filename);
    std::stringstream content;
    if (!inputFile.is_open())
    {
        std::cerr << "Unable to open file: " << filename << std::endl;
        return "";
    }
    std::string line;
    while (std::getline(inputFile, line))
    {
        content << line << "\n"; // Append the line to the content
    }

    inputFile.close();

    return content.str(); // Return the content as a string
}
enum TokenType
{
    Keyword,
    Identifier,
    Operator,
    Literal,
    Punctuation,
    Comment,
    Whitespace,
    Special
};

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

struct Token
{
    TokenType type;
    std::string value;
};

std::vector<Token> tokenize(std::string src)
{
    std::vector<Token> tokens;
    for(char c : src){
        // Single character tokens 
        // Multi character tokens
    }
    return tokens;
}
int main()
{
    std::string sourceCode = readFile("code.st");
    std::vector<Token> tokens = tokenize(sourceCode);
    for (Token token : tokens)
    {
        std::cout << token.type << std::endl;
    }
    
    return 0;
}