// Script to update articles with longer, more detailed content
require("dotenv").config();
const mongoose = require("mongoose");
const Article = require("./models/Article");

async function updateArticleContent() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const articleUpdates = [
      {
        title: "The Ultimate Guide to Extra Virgin Olive Oil",
        content: `Extra virgin olive oil represents the pinnacle of olive oil quality, obtained through cold pressing of the finest olives. This comprehensive guide explores everything you need to know about this liquid gold from the Mediterranean.

The production process begins in our ancient olive groves of Puglia, where centuries-old trees produce olives with exceptional flavor profiles. The harvest timing is crucial - we pick our olives at the perfect moment of ripeness to ensure maximum nutritional content and optimal taste.

Cold extraction is essential for maintaining the oil's beneficial properties. Unlike refined oils, extra virgin olive oil retains all its natural antioxidants, vitamins, and polyphenols. These compounds provide numerous health benefits, including anti-inflammatory properties and cardiovascular protection.

When selecting extra virgin olive oil, look for key quality indicators: a rich, golden-green color, fruity aroma, and a slight peppery finish that indicates the presence of healthy polyphenols. Our Promontolio oils meet the highest international standards for purity and quality.

Storage is equally important - keep your olive oil in a cool, dark place away from heat and light to preserve its exceptional characteristics and extend its shelf life.`,
        excerpt:
          "Discover the secrets of authentic extra virgin olive oil production, from harvest to bottle, and learn how to identify truly exceptional quality.",
      },
      {
        title: "Mediterranean Olive Oil Pasta Recipe",
        content: `This traditional Mediterranean pasta recipe showcases the pure, unadulterated flavor of premium olive oil. Simple yet sophisticated, it demonstrates how quality ingredients can create an extraordinary culinary experience.

Ingredients for 4 servings:
- 400g spaghetti or linguine
- 6 tablespoons Promontolio extra virgin olive oil
- 4 cloves garlic, thinly sliced
- 1 teaspoon red pepper flakes
- Fresh parsley, chopped
- Parmigiano-Reggiano cheese, grated
- Sea salt and black pepper

Begin by bringing a large pot of salted water to boil. The key to perfect pasta is using abundant water and proper salt levels - the water should taste like mild seawater.

While the pasta cooks, gently heat the olive oil in a large skillet over medium-low heat. Add the sliced garlic and red pepper flakes, cooking slowly until the garlic becomes fragrant and golden. This slow infusion process allows the flavors to meld perfectly without burning the delicate garlic.

Reserve one cup of pasta cooking water before draining. The starchy pasta water will help create a silky sauce that coats each strand perfectly.

Toss the hot pasta with the olive oil mixture, adding pasta water gradually until you achieve the perfect consistency. The sauce should glisten and coat the pasta without being oily.

Finish with fresh parsley, generous grated Parmigiano-Reggiano, and freshly cracked black pepper. The result is a dish that celebrates the pure flavors of the Mediterranean.`,
        excerpt:
          "Learn to prepare this classic Mediterranean pasta that highlights the exceptional flavor of premium olive oil with simple, authentic techniques.",
      },
      {
        title: "Health Benefits of Olive Oil",
        content: `Scientific research consistently demonstrates that extra virgin olive oil offers remarkable health benefits, making it a cornerstone of the Mediterranean diet and a powerful ally for long-term wellness.

Cardiovascular Health:
The monounsaturated fats in olive oil, particularly oleic acid, help reduce bad cholesterol levels while maintaining healthy HDL cholesterol. Studies show that regular consumption can significantly reduce the risk of heart disease and stroke.

Anti-Inflammatory Properties:
Olive oil contains powerful antioxidants like vitamin E and polyphenols, which combat inflammation throughout the body. The compound oleocanthal provides natural anti-inflammatory effects similar to ibuprofen, but without side effects.

Brain Health and Cognitive Function:
Research indicates that the Mediterranean diet, rich in olive oil, may protect against cognitive decline and reduce the risk of Alzheimer's disease. The healthy fats support brain cell membrane integrity and neurotransmitter function.

Cancer Prevention:
The antioxidants in extra virgin olive oil may help prevent certain types of cancer by neutralizing free radicals and supporting cellular health. Studies particularly highlight benefits for breast and digestive system cancers.

Digestive Health:
Olive oil promotes healthy digestion and nutrient absorption. It may also support beneficial gut bacteria while providing protection against stomach ulcers.

Skin and Beauty Benefits:
The vitamin E and antioxidants in olive oil support skin health from the inside out, promoting a natural glow and helping to maintain skin elasticity.

To maximize these benefits, choose authentic extra virgin olive oil and incorporate it into your daily diet through cooking, salad dressings, and finishing oils.`,
        excerpt:
          "Explore the scientifically-proven health benefits of extra virgin olive oil, from heart health to brain function and natural anti-inflammatory effects.",
      },
      {
        title: "Traditional vs Modern Olive Oil Production",
        content: `The evolution of olive oil production represents a fascinating journey from ancient traditions to cutting-edge technology, each method offering unique advantages and characteristics.

Traditional Stone Mill Production:
For centuries, olive oil has been produced using massive stone wheels that slowly crush olives into a paste. This gentle process, still used at Promontolio, preserves the delicate cellular structure of the olives and maintains optimal flavor compounds.

The traditional method involves several careful steps: cleaning and washing the olives, crushing them with granite stones, malaxing (mixing) the paste to allow oil droplets to coalesce, and finally pressing or centrifuging to separate the oil from water and solids.

This time-honored approach produces oil with exceptional organoleptic properties - complex flavors, rich aromas, and superior mouthfeel. However, it requires skilled artisans and more time to process smaller quantities.

Modern Centrifugal Extraction:
Contemporary production utilizes high-speed centrifuges and sophisticated temperature control systems. This method offers greater efficiency, consistency, and the ability to process larger volumes while maintaining quality standards.

Modern facilities can better control variables like temperature, processing time, and cleanliness, resulting in oils with excellent shelf stability and consistent quality characteristics.

Hybrid Approaches:
Many premium producers, including Promontolio, combine the best of both worlds. We use traditional stone mills for crushing while employing modern centrifugal separation and climate control to ensure optimal quality and safety.

Quality Considerations:
Regardless of method, the key factors remain constant: using fresh, high-quality olives, maintaining low temperatures during processing, minimizing exposure to oxygen and light, and processing quickly after harvest.

The choice between traditional and modern methods often reflects the producer's philosophy and target market, with both capable of producing exceptional extra virgin olive oil when executed with skill and attention to detail.`,
        excerpt:
          "Compare traditional stone mill production with modern extraction methods and discover how artisanal techniques create exceptional olive oil quality.",
      },
    ];

    // Update each article
    for (const update of articleUpdates) {
      const result = await Article.updateOne(
        { title: update.title },
        {
          content: update.content,
          excerpt: update.excerpt,
        }
      );
      console.log(
        `Updated "${update.title}": ${result.modifiedCount} document(s) modified`
      );
    }

    console.log("\nAll articles updated with longer content!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    mongoose.connection.close();
  }
}

updateArticleContent();
