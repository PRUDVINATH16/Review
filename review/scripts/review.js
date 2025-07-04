const resultBtn = document.querySelector('.get-result');
const langsDropdown = document.querySelector('#languages-dropdown');
const loader = document.getElementById('loader');
const result_box = document.querySelector('.review-output');

function adding_lister_to_option() {
  document.querySelectorAll('.option').forEach((option) => {
    option.addEventListener('click', () => {
      langsDropdown.innerHTML = `
      <span class="language">${option.value} <img src="img/down-arrow.png" alt="down-arrow"></span>

      <div class="options">
        <option class="option" value="Telugu">Telugu</option>
        <option class="option" value="Hindi">Hindi</option>
        <option class="option" value="English">English</option>
        <option class="option" value="Tamil">Tamil</option>
        <option class="option" value="Malayalam">Malayalam</option>
        <option class="option" value="Kanada">Kanada</option>
      </div>
    `;
      resultBtn.style.display = 'block';
      adding_lister_to_option();
    });
  });
}
adding_lister_to_option();

langsDropdown.addEventListener('mouseenter', () => {
  document.querySelector('.options').style.display = 'flex';
  resultBtn.style.display = 'none';
});

langsDropdown.addEventListener('mouseleave', () => {
  document.querySelector('.options').style.display = 'none';
  resultBtn.style.display = 'block';
});

resultBtn.addEventListener('click', async () => {
  /* API_KEY = 'AIzaSyCoyWGAiVO_JjKWIq8oa1-g7XkAK0cngRs';
  const model = new ChatGoogleGenerativeAI({
    modelName: "gemini-2.0-flash",
    apiKey: API_KEY,
  });

  const prompt1 = ChatPromptTemplate.fromTemplate(
    "Translate this english movie into {language}. Review: {review}"
  );

  const prompt2 = ChatPromptTemplate.fromTemplate(
    "Summarize this {language} review in {language} only. Review: {review}"
  );

  const parser = new StringOutputParser();

  const chain1 = prompt1.pipe(model).pipe(parser);

  const chain2 = prompt2.pipe(model).pipe(parser);

  const finalChain = chain1.pipe(chain2)

  const result = await finalChain.invoke({ review, language });
  console.log(result)
  document.querySelector('.review-output').innerHTML = result; */

  let review = document.querySelector('.review-input').value;
  let language = document.querySelector('.language').innerHTML;
  result_box.innerHTML = '';
  loader.style.display = 'block';

  if (review == '') {
    document.querySelector('.review-output').innerHTML = "Please provide some review text for translate and summarize.";
    loader.style.display = 'none';
  }
  else {
    try {
      const res = await fetch('https://review-converter.onrender.com/summarize', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ review, language })
      });
      const data = await res.json();
      result_box.innerHTML = `
      ${data.output}<br><br>
      Sentiment: ${data.sentimentt}<br>
      <button class="copy-btn">Copy</button>
      <button class="one-more">One More</button>
      <button class="delete-storage">Delete History</button>
      `;

      let pastReviews = new Array();
      let pastReview = JSON.parse(localStorage.getItem('past-reviews')) || [];
      pastReviews = pastReview;
      pastReviews.push({ review: review, output: data.output });
      if (pastReviews.length >= 5) {
        pastReviews.shift();
      }
      localStorage.setItem('past-reviews', JSON.stringify(pastReviews));

      setTimeout(() => {
        const copyBtn = document.querySelector('.copy-btn');
        copyBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(data.output);
          copyBtn.innerHTML = `Text Copied 👍`
        });

        const oneMore = document.querySelector('.one-more');
        oneMore.addEventListener('click', () => {
          document.querySelector('.review-input').value = '';
          result_box.innerHTML = '';
          setPastReviews();
        });

        document.querySelector('.delete-storage').addEventListener('click', () => {
          localStorage.removeItem('past-reviews');

          document.querySelector('.review-input').value = '';
          result_box.innerHTML = '';
          setPastReviews();
        })
      }, 100);
    }
    catch (error) {
      result_box.innerHTML = 'Oops! Something went wrong. Try again later';
      console.log(error)
    }
    finally {
      loader.style.display = 'none';
    }
  }
});

async function setPastReviews() {
  let pastReviews = await JSON.parse(localStorage.getItem('past-reviews')) || [];
  let pastContainer = document.querySelector('.past-reviewss');
  let pastHTML = '';

  pastReviews.forEach((review) => {
    pastHTML += `
      <div class="user-input"><p>${review.review}</p></div>
      <div class="ai-output"><p>${review.output}<br>
      </p>
      </div><br>
    `;
  });

  pastContainer.innerHTML = pastHTML;
}

window.addEventListener('DOMContentLoaded', () => {
  setPastReviews();
});
