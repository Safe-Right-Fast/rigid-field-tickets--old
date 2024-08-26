import React, { useState } from 'react';

function DynamicForm({ questions }) {

    const formQuestions = Object.keys(questions);

  const [formData, setFormData] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <>

        <h2 className="text-2xl font-bold mb-4"></h2>
        <form onSubmit={handleSubmit}>
          {formQuestions.map((question, index) => (
            <div className="mb-4" key={index}>
              <label
                htmlFor={question.name}
                className="block text-gray-700 font-medium"
              >
                {question.label}
              </label>
              <input
                type={question.type}
                id={question.name}
                name={question.name}
                value={formData[question.name]}
                onChange={handleChange}
                className="border border-gray-300 rounded-md p-2 w-full"
                required={question.required}
              />
            </div>
          ))}

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Submit
            </button>
          </div>
        </form>
    </>
  );
}

export default DynamicForm;
