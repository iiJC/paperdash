class ReviewItem {
  constructor(topic, lastReviewed, reviewCount = 0) {
    this.topic = topic;
    this.lastReviewed = lastReviewed ? new Date(lastReviewed) : new Date();
    this.reviewCount = reviewCount;
  }

  calculateNextReview() {
    const daysToAdd = [1, 2, 7, 14, 30, 60, 120]; // review intervals in days
    let nextReviewDays = daysToAdd[this.reviewCount] || 180; // default to a semi-annual review if beyond array
    let nextReviewDate = new Date(this.lastReviewed);
    nextReviewDate.setDate(nextReviewDate.getDate() + nextReviewDays);
    return nextReviewDate;
  }

  reviewDone() {
    this.lastReviewed = new Date(); // update last reviewed to today
    this.reviewCount++; // increment the count of reviews
  }
}

class SpacedRepetitionSystem {
  constructor() {
    this.items = this.loadItems();
  }

  addItem(topic) {
    this.items.push(new ReviewItem(topic));
    this.saveItems();
  }

  reviewItem(index) {
    if (index >= 0 && index < this.items.length) {
      this.items[index].reviewDone();
      this.saveItems();
    }
  }

  getNextItems() {
    // Sort items by the next review date
    this.items.sort(
      (a, b) => a.calculateNextReview() - b.calculateNextReview()
    );
    return this.items.map((item) => ({
      topic: item.topic,
      nextReview: item.calculateNextReview(),
    }));
  }

  saveItems() {
    localStorage.setItem(
      "reviewItems",
      JSON.stringify(
        this.items.map((item) => ({
          topic: item.topic,
          lastReviewed: item.lastReviewed,
          reviewCount: item.reviewCount,
        }))
      )
    );
  }

  loadItems() {
    const data = JSON.parse(localStorage.getItem("reviewItems"));
    if (data) {
      return data.map(
        (item) =>
          new ReviewItem(item.topic, item.lastReviewed, item.reviewCount)
      );
    } else {
      return [];
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const srs = new SpacedRepetitionSystem();
  updateReviewList();
  checkForDueReviews();

  window.addTopic = function () {
    const topicInput = document.getElementById("newTopic");
    const topic = topicInput.value.trim();
    if (topic) {
      srs.addItem(topic);
      topicInput.value = ""; // Clear input field
      updateReviewList();
    }
  };

  function updateReviewList() {
    const reviewList = document.getElementById("reviewList");
    reviewList.innerHTML = ""; // Clear existing list

    srs.getNextItems().forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${
        item.topic
      } - Next Review: ${item.nextReview.toDateString()}`;
      reviewList.appendChild(li);
    });
  }

  function checkForDueReviews() {
    const today = new Date().toDateString();
    srs.getNextItems().forEach((item) => {
      if (item.nextReview.toDateString() === today) {
        showNotification(item.topic);
      }
    });
  }

  function showNotification(topic) {
    if (Notification.permission === "granted") {
      new Notification("Time to review!", {
        body: `It's time to review: ${topic}`,
        icon: "notification_icon.png", // Optional: add an icon path
      });
    }
  }

  window.requestNotificationPermission = function () {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        console.log("Notification permission granted.");
      }
    });
  };
});

// Example Usage:
const srs = new SpacedRepetitionSystem();
srs.addItem("JavaScript Basics");
srs.addItem("CSS Grids");
srs.reviewItem(0); // Simulate reviewing the first topic

console.log(srs.getNextItems());
