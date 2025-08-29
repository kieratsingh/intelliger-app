public class SmithNumberTest {
    
    public static void main(String[] args) {
        System.out.println("=== Smith Number Test Examples ===\n");
        
        // Test some known Smith numbers
        int[] testNumbers = {4, 22, 27, 58, 85, 94, 121, 166, 202, 265};
        
        for (int num : testNumbers) {
            System.out.println("Testing number: " + num);
            
            // Get prime factors
            java.util.List<Integer> factors = SmithNumber.getPrimeFactors(num);
            
            // Calculate sums
            int digitSum = SmithNumber.sumOfDigits(num);
            int factorDigitSum = SmithNumber.sumOfPrimeFactorDigits(num);
            
            System.out.println("  Prime factors: " + factors);
            System.out.println("  Sum of digits: " + digitSum);
            System.out.println("  Sum of factor digits: " + factorDigitSum);
            
            if (SmithNumber.isSmithNumber(num)) {
                System.out.println("  ✓ " + num + " is a Smith number!");
            } else {
                System.out.println("  ✗ " + num + " is NOT a Smith number.");
            }
            System.out.println();
        }
        
        // Show first 10 Smith numbers
        System.out.println("First 10 Smith numbers:");
        SmithNumber.findSmithNumbers(10);
        
        // Demonstrate with a specific example
        System.out.println("\n=== Detailed Example: 22 ===");
        int example = 22;
        System.out.println("Number: " + example);
        System.out.println("Prime factors: " + SmithNumber.getPrimeFactors(example));
        System.out.println("Sum of digits: 2 + 2 = " + SmithNumber.sumOfDigits(example));
        System.out.println("Sum of factor digits: 2 + 1 + 1 = " + SmithNumber.sumOfPrimeFactorDigits(example));
        System.out.println("Since 4 = 4, 22 is a Smith number!");
    }
}

