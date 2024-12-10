// 获取 DOM 元素
const searchInput = document.querySelector(".search_bar input");
const dropdown = document.querySelector("#search_option");

// 捕捉回车键事件
searchInput.addEventListener("keydown", async (event) => {
  if (event.key === "Enter") {
    const query = searchInput.value.trim(); // 获取搜索输入
    const option = dropdown.value; // 获取下拉菜单选项

    if (!query) {
      alert("Please enter a search term.");
      return;
    }

    let url = "";
    if (option === "professors") {
      url = `/professors/search?name=${encodeURIComponent(query)}`; // 搜索教授
    } else if (option === "classes") {
      url = `/course/${encodeURIComponent(query)}`; // 搜索课程
    }

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        displaySearchResults(data, option); // 调用显示结果函数
      } else {
        alert(data.error || "No results found.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("An error occurred while searching. Please try again.");
    }
  }
});

// 显示搜索结果的函数
function displaySearchResults(results, type) {
    const container = document.querySelector(".main-content");
    container.innerHTML = ""; // 清空之前的内容
  
    // 检查是否有结果
    if (!results || (Array.isArray(results) && results.length === 0)) {
      container.innerHTML = `
        <div class="result-card">
          <p>No ${type === "professors" ? "professors" : "classes"} found for the given query.</p>
        </div>`;
      return;
    }
  
    // 遍历结果并创建卡片
    if (type === "professors") {
      results.forEach((professor) => {
        const card = document.createElement("div");
        card.classList.add("result-card");
        card.innerHTML = `
          <h3>${professor.name}</h3>
          <p>Department: ${professor.department || "N/A"}</p>
          <p>Email: ${professor.email || "N/A"}</p>
        `;
        container.appendChild(card);
      });
    } else if (type === "classes") {
      const card = document.createElement("div");
      card.classList.add("result-card");
      card.innerHTML = `
        <h3>${results.name}</h3>
        <p>Description: ${results.description || "N/A"}</p>
        <p>Professor: ${results.professor?.name || "N/A"}</p>
      `;
      container.appendChild(card);
    }
  }
  
