// Script to update articles with professional HTML formatting
require("dotenv").config();
const mongoose = require("mongoose");
const Article = require("./models/Article");

async function updateArticleFormatting() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const articleUpdates = [
      {
        title: "The Ultimate Guide to Extra Virgin Olive Oil",
        content: `<p>Extra virgin olive oil represents the pinnacle of olive oil quality, obtained through cold pressing of the finest olives. This comprehensive guide explores everything you need to know about this liquid gold from the Mediterranean.</p>

<h2>The Art of Olive Cultivation</h2>
<p>The production process begins in our ancient olive groves of Puglia, where centuries-old trees produce olives with exceptional flavor profiles. The harvest timing is crucial - we pick our olives at the perfect moment of ripeness to ensure maximum nutritional content and optimal taste.</p>

<p>Our groves benefit from the unique microclimate of the Gargano Peninsula, where sea breezes and limestone-rich soil create ideal growing conditions for premium olives.</p>

<h2>Cold Extraction Process</h2>
<p>Cold extraction is essential for maintaining the oil's beneficial properties. Unlike refined oils, extra virgin olive oil retains all its natural antioxidants, vitamins, and polyphenols. These compounds provide numerous health benefits, including anti-inflammatory properties and cardiovascular protection.</p>

<blockquote>"The difference between good olive oil and exceptional olive oil lies in the details of production - from the moment of harvest to the final bottling."</blockquote>

<h2>Quality Indicators</h2>
<p>When selecting extra virgin olive oil, look for these key quality indicators:</p>
<ul>
<li><strong>Rich, golden-green color</strong> that indicates optimal harvest timing</li>
<li><strong>Fruity aroma</strong> with notes of fresh grass and herbs</li>
<li><strong>Slight peppery finish</strong> that indicates the presence of healthy polyphenols</li>
<li><strong>Proper packaging</strong> in dark glass bottles to protect from light</li>
</ul>

<p>Our Promontolio oils meet the highest international standards for purity and quality, ensuring every bottle delivers the authentic taste of Puglia.</p>

<h2>Storage and Preservation</h2>
<p>Storage is equally important - keep your olive oil in a cool, dark place away from heat and light to preserve its exceptional characteristics and extend its shelf life. Properly stored extra virgin olive oil maintains its quality for up to two years from production.</p>`,
      },
      {
        title: "Mediterranean Olive Oil Pasta Recipe",
        content: `<p>This traditional Mediterranean pasta recipe showcases the pure, unadulterated flavor of premium olive oil. Simple yet sophisticated, it demonstrates how quality ingredients can create an extraordinary culinary experience.</p>

<h2>Ingredients</h2>
<p><em>Serves 4 people</em></p>
<ul>
<li>400g spaghetti or linguine</li>
<li>6 tablespoons Promontolio extra virgin olive oil</li>
<li>4 cloves garlic, thinly sliced</li>
<li>1 teaspoon red pepper flakes</li>
<li>Fresh parsley, chopped</li>
<li>Parmigiano-Reggiano cheese, freshly grated</li>
<li>Sea salt and freshly cracked black pepper</li>
</ul>

<h2>Preparation Method</h2>
<p>Begin by bringing a large pot of salted water to boil. The key to perfect pasta is using abundant water and proper salt levels - the water should taste like mild seawater.</p>

<p>While the pasta cooks, gently heat the olive oil in a large skillet over medium-low heat. Add the sliced garlic and red pepper flakes, cooking slowly until the garlic becomes fragrant and golden. This slow infusion process allows the flavors to meld perfectly without burning the delicate garlic.</p>

<blockquote>"The secret to this dish is patience - let the garlic gently infuse the oil to create a base of incredible flavor."</blockquote>

<h2>Assembly and Serving</h2>
<p>Reserve one cup of pasta cooking water before draining. The starchy pasta water will help create a silky sauce that coats each strand perfectly.</p>

<p>Toss the hot pasta with the olive oil mixture, adding pasta water gradually until you achieve the perfect consistency. The sauce should glisten and coat the pasta without being oily.</p>

<p>Finish with fresh parsley, generous grated Parmigiano-Reggiano, and freshly cracked black pepper. The result is a dish that celebrates the pure flavors of the Mediterranean.</p>

<h2>Chef's Tips</h2>
<ul>
<li>Use the highest quality olive oil you can find - it makes all the difference</li>
<li>Never let the garlic brown or it will become bitter</li>
<li>Save some pasta water - it's your secret weapon for perfect texture</li>
<li>Serve immediately while the pasta is hot and the cheese melts perfectly</li>
</ul>`,
      },
      {
        title: "Health Benefits of Olive Oil",
        content: `<p>Scientific research consistently demonstrates that extra virgin olive oil offers remarkable health benefits, making it a cornerstone of the Mediterranean diet and a powerful ally for long-term wellness.</p>

<h2>Cardiovascular Health</h2>
<p>The monounsaturated fats in olive oil, particularly oleic acid, help reduce bad cholesterol levels while maintaining healthy HDL cholesterol. Studies show that regular consumption can significantly reduce the risk of heart disease and stroke.</p>

<p>Research published in the <em>New England Journal of Medicine</em> found that people following a Mediterranean diet rich in olive oil had a 30% lower risk of major cardiovascular events.</p>

<h2>Anti-Inflammatory Properties</h2>
<p>Olive oil contains powerful antioxidants like vitamin E and polyphenols, which combat inflammation throughout the body. The compound oleocanthal provides natural anti-inflammatory effects similar to ibuprofen, but without side effects.</p>

<blockquote>"Nature has provided us with one of the most powerful anti-inflammatory compounds in the form of extra virgin olive oil."</blockquote>

<h2>Brain Health and Cognitive Function</h2>
<p>Research indicates that the Mediterranean diet, rich in olive oil, may protect against cognitive decline and reduce the risk of Alzheimer's disease. The healthy fats support brain cell membrane integrity and neurotransmitter function.</p>

<ul>
<li><strong>Memory enhancement</strong> through improved neural communication</li>
<li><strong>Neuroprotection</strong> against age-related cognitive decline</li>
<li><strong>Mood regulation</strong> through balanced neurotransmitter production</li>
</ul>

<h2>Cancer Prevention</h2>
<p>The antioxidants in extra virgin olive oil may help prevent certain types of cancer by neutralizing free radicals and supporting cellular health. Studies particularly highlight benefits for breast and digestive system cancers.</p>

<h2>Digestive Health</h2>
<p>Olive oil promotes healthy digestion and nutrient absorption. It may also support beneficial gut bacteria while providing protection against stomach ulcers.</p>

<h2>Natural Beauty Benefits</h2>
<p>The vitamin E and antioxidants in olive oil support skin health from the inside out, promoting a natural glow and helping to maintain skin elasticity.</p>

<p><strong>Recommendation:</strong> To maximize these benefits, choose authentic extra virgin olive oil and incorporate it into your daily diet through cooking, salad dressings, and finishing oils.</p>`,
      },
      {
        title: "Traditional vs Modern Olive Oil Production",
        content: `<p>The evolution of olive oil production represents a fascinating journey from ancient traditions to cutting-edge technology, each method offering unique advantages and characteristics.</p>

<h2>Traditional Stone Mill Production</h2>
<p>For centuries, olive oil has been produced using massive stone wheels that slowly crush olives into a paste. This gentle process, still used at Promontolio, preserves the delicate cellular structure of the olives and maintains optimal flavor compounds.</p>

<h3>The Traditional Process</h3>
<ol>
<li><strong>Cleaning and washing</strong> the olives to remove debris</li>
<li><strong>Crushing</strong> with granite stones to create olive paste</li>
<li><strong>Malaxing</strong> (mixing) to allow oil droplets to coalesce</li>
<li><strong>Pressing or centrifuging</strong> to separate oil from water and solids</li>
</ol>

<p>This time-honored approach produces oil with exceptional organoleptic properties - complex flavors, rich aromas, and superior mouthfeel. However, it requires skilled artisans and more time to process smaller quantities.</p>

<blockquote>"Traditional methods connect us to centuries of Mediterranean culture and produce olive oil with unmatched character and depth."</blockquote>

<h2>Modern Centrifugal Extraction</h2>
<p>Contemporary production utilizes high-speed centrifuges and sophisticated temperature control systems. This method offers greater efficiency, consistency, and the ability to process larger volumes while maintaining quality standards.</p>

<h3>Advantages of Modern Methods</h3>
<ul>
<li><strong>Precise temperature control</strong> ensuring optimal extraction conditions</li>
<li><strong>Consistent quality</strong> through automated monitoring systems</li>
<li><strong>Higher efficiency</strong> allowing processing of larger olive quantities</li>
<li><strong>Enhanced cleanliness</strong> reducing contamination risks</li>
</ul>

<h2>Hybrid Approaches</h2>
<p>Many premium producers, including Promontolio, combine the best of both worlds. We use traditional stone mills for crushing while employing modern centrifugal separation and climate control to ensure optimal quality and safety.</p>

<p>This hybrid approach allows us to maintain the artisanal character of traditional production while benefiting from modern quality control and efficiency improvements.</p>

<h2>Quality Considerations</h2>
<p>Regardless of method, the key factors remain constant:</p>
<ul>
<li>Using fresh, high-quality olives</li>
<li>Maintaining low temperatures during processing</li>
<li>Minimizing exposure to oxygen and light</li>
<li>Processing quickly after harvest</li>
</ul>

<p>The choice between traditional and modern methods often reflects the producer's philosophy and target market, with both capable of producing exceptional extra virgin olive oil when executed with skill and attention to detail.</p>`,
      },
    ];

    // Update each article
    for (const update of articleUpdates) {
      const result = await Article.updateOne(
        { title: update.title },
        { content: update.content }
      );
      console.log(
        `Updated "${update.title}": ${result.modifiedCount} document(s) modified`
      );
    }

    console.log("\nAll articles updated with professional HTML formatting!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    mongoose.connection.close();
  }
}

updateArticleFormatting();
