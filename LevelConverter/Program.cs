
using System.Drawing;

namespace LevelConverter
{
    class Program
    {
        static void Main(string[] args)
        {
            string directory = Directory.GetCurrentDirectory();
            string inputDirectory = directory + @"\Input\";
            string outputDirectory = Path.GetFullPath(Path.Combine(directory, @"..\src\layout\levels\"));

            // Check if input directory exists
            if(!Directory.Exists(inputDirectory)){
                Console.WriteLine("No input directory found.");
                Directory.CreateDirectory(inputDirectory);
                return;
            }

            // Checks for .png files inside directory
            string[] inputFiles = Directory.GetFiles(inputDirectory, "*.png");
            if(inputFiles.Length == 0){
                Console.WriteLine("No files count be found to convert.");
                return;
            }

            // Creates output directory if it doesn't exist
            if(!Directory.Exists(outputDirectory)){
                Directory.CreateDirectory(outputDirectory);
            }

            const string wall = "ff000000";
            const string player = "ff00c800";
            Bitmap workingImage;
            string output, outputY, outputFile, classStart, classEnd, levelName, className, colour, playerPosition;

            foreach(string fileString in inputFiles){

                // Gets the file's name to create the level out of it
                levelName = Path.GetFileName(fileString); // Gets the file name only
                className = levelName.Remove(levelName.Length - 4, 4); // Takes ".png" off of the end of the file name
                outputFile = outputDirectory + className + ".js";
                playerPosition = "1, 1";
                Console.WriteLine("\nConverting " + className + "...");

                // Creating the array
                workingImage = (Bitmap)Image.FromFile(fileString);
                output = "[\n";
                for(int x = 0; x < workingImage.Width; x++){
                    if(x != 0) output += ",\n";
                    outputY = "\t\t\t\t[";
                    for(int y = 0; y < workingImage.Height; y++){
                        if(y != 0) outputY += ",";
                        colour = workingImage.GetPixel(x, y).Name;
                        if(colour == wall) outputY += "1";
                        else if(colour == player){
                            playerPosition = (x + 0.5) + ", " + (y + 0.5);
                        }
                    }
                    output += outputY + "]";
                }

                // Create the class file
                classStart = "import DefaultLevel from \"./DefaultLevel.js\";\n\nclass " + className + " extends DefaultLevel{\n\tconstructor(){\n\t\tsuper(" + playerPosition +");\n\t\tthis._layoutManager.setLayout(\n\t\t\t";
                classEnd = "\n\t\t);\n\t}\n\tsummon(){\n\t\treturn []; //ADD ENTITIES INTO THIS ARRAY\n\t}\n}\n\nexport default " + className + ";";

                output = classStart + output + "\n\t\t\t]" + classEnd;
                File.WriteAllText(outputFile, output);
            }

            Console.WriteLine("Finished!");
        }
    }
}
