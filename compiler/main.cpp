#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include "tokenizer.h"

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

int main()
{
    std::string sourceCode = readFile("code.st");
    std::vector<Token> tokens = tokenize(sourceCode);6
    for (Token token : tokens)
    {
        std::cout << token.type << " | " << token.value << std::endl;
    }

    return 0;
}