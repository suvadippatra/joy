const fs = require('fs');
let c = fs.readFileSync('src/pages/CBTViewer.tsx', 'utf8');

const newScript = "          <script>\n" +
"            (function() {\n" +
"              let reportSent = false;\n" +
"              const checkResults = () => {\n" +
"                 if (reportSent) return;\n" +
"                 \n" +
"                 const pageText = document.body.innerText || '';\n" +
"                 const gateway = document.getElementById('result-gateway') || \n" +
"                                 document.querySelector('.result-panel') ||\n" +
"                                 document.querySelector('.score-card') ||\n" +
"                                 document.getElementById('score-card');\n" +
"                                 \n" +
"                 // Detect if we are on a result page\n" +
"                 const isResultPage = (gateway && !gateway.classList.contains('hidden')) || \n" +
"                                      pageText.includes('Total Score') || \n" +
"                                      pageText.includes('Test Summary') ||\n" +
"                                      pageText.includes('Test Result');\n" +
"                                      \n" +
"                 if (isResultPage) {\n" +
"                     reportSent = true;\n" +
"                     \n" +
"                     // 1. Try standard NTA clone IDs first\n" +
"                     let score = document.getElementById('gt-score')?.innerText || document.getElementById('score')?.innerText;\n" +
"                     let correct = document.getElementById('gt-correct')?.innerText || document.getElementById('correct-ans')?.innerText || document.getElementById('correct')?.innerText;\n" +
"                     let wrong = document.getElementById('gt-wrong')?.innerText || document.getElementById('incorrect-ans')?.innerText || document.getElementById('wrong')?.innerText;\n" +
"                     let attempt = document.getElementById('gt-attempt')?.innerText || document.getElementById('attempted-ques')?.innerText || document.getElementById('attempted')?.innerText;\n" +
"                     let time = document.getElementById('gt-time')?.innerText || document.getElementById('time-taken')?.innerText;\n" +
"                     let accuracy = document.getElementById('gt-accuracy')?.innerText || document.getElementById('accuracy')?.innerText;\n" +
"                     \n" +
"                     // 2. Fallback to Regex parsing if IDs are missing\n" +
"                     if (!score) {\n" +
"                         const m = pageText.match(/(?:Score|Marks|Total Score)\\s*[:\\-]?\\s*(\\d+\\.?\\d*)/i);\n" +
"                         score = m ? m[1] : '0';\n" +
"                     }\n" +
"                     if (!correct) {\n" +
"                         const m = pageText.match(/(?:Correct|Correct Answers?)\\s*[:\\-]?\\s*(\\d+)/i);\n" +
"                         correct = m ? m[1] : '0';\n" +
"                     }\n" +
"                     if (!wrong) {\n" +
"                         const m = pageText.match(/(?:Wrong|Incorrect|Incorrect Answers?)\\s*[:\\-]?\\s*(\\d+)/i);\n" +
"                         wrong = m ? m[1] : '0';\n" +
"                     }\n" +
"                     if (!attempt) {\n" +
"                         const m = pageText.match(/(?:Attempted|Attempted Questions?)\\s*[:\\-]?\\s*(\\d+)/i);\n" +
"                         attempt = m ? m[1] : '0';\n" +
"                     }\n" +
"                     if (!time) {\n" +
"                         const m = pageText.match(/(?:Time|Time Taken)\\s*[:\\-]?\\s*([\\d\\w\\s:]+)/i);\n" +
"                         time = m ? m[1].trim() : '0s';\n" +
"                     }\n" +
"                     \n" +
"                     // Calculate accuracy if missing\n" +
"                     if (!accuracy) {\n" +
"                         const m = pageText.match(/Accuracy\\s*[:\\-]?\\s*(\\d+\\.?\\d*)/i);\n" +
"                         if (m) {\n" +
"                             accuracy = m[1] + '%';\n" +
"                         } else {\n" +
"                             const c = parseInt(correct || '0');\n" +
"                             const a = parseInt(attempt || '0');\n" +
"                             accuracy = (a > 0) ? ((c / a) * 100).toFixed(1) + '%' : '0%';\n" +
"                         }\n" +
"                     }\n" +
"                     \n" +
"                     window.parent.postMessage({\n" +
"                         type: 'CBT_SUBMIT',\n" +
"                         payload: { testId: '${test.id}', score, correct, wrong, accuracy, attempt, time }\n" +
"                     }, '*');\n" +
"                 }\n" +
"              };\n" +
"              \n" +
"              const observer = new MutationObserver(checkResults);\n" +
"              window.addEventListener('DOMContentLoaded', () => {\n" +
"                  observer.observe(document.body, { attributes: true, childList: true, subtree: true });\n" +
"                  setInterval(checkResults, 1000);\n" +
"              });\n" +
"            })();\n" +
"          </script>";

const startIndex = c.indexOf('<script>\n            (function() {\n              let reportSent = false;');
if (startIndex !== -1) {
    const endIndex = c.indexOf('</script>', startIndex) + 9;
    c = c.substring(0, startIndex) + newScript + c.substring(endIndex);
    fs.writeFileSync('src/pages/CBTViewer.tsx', c);
    console.log('Fixed CBTViewer');
} else {
    console.log('Could not find the script in CBTViewer.tsx');
}
