import React, { useState, useEffect, useContext } from "react";
import { Nav, Navbar } from "react-bootstrap";
import CategoryAPI from "../../../apis/CategoryAPI";
import "./SideNav.css";
import { ActiveCategoryContext } from "../../../context/ActiveCategoryProvider";
import { Chip } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

function SideNav() {
  const [sidenav, toggleSidenav] = useState(false);
  const showSidenav = () => toggleSidenav(!sidenav);
  const [activeCategoryState, activeCategoryDispatch] = useContext(
    ActiveCategoryContext
  );
  const [categories, setCategories] = useState([]);

  const images = importAllImages(
    require.context("../../../assets/img/icons/", true)
  );

  const refreshCategories = () => {
   CategoryAPI.getCategories()
      .then((response) => {
        setCategories(response.data.categories);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    refreshCategories();
  }, []);

  const handleUpdateActiveCategory = (categoryName) => {
    if (activeCategoryState.activeCategory !== categoryName) {
      activeCategoryDispatch({ type: categoryName });
    } else {
      activeCategoryDispatch({ type: "deselect" });
    }
  };

  const formatString = (stringToFormat) => {
    return stringToFormat
      .toLowerCase()
      .trim()
      .replace("-", "")
      .replace(" ", "");
  };

  function importAllImages(temp) {
    let images = {};
    temp.keys().map((image) => {
      images[image.replace("./", "")] = temp(image);
    });
    return images;
  }

  return (
    <Navbar className="navbar-side">
      <Chip
        icon={sidenav ? <ExpandLess /> : <ExpandMore />}
        label="Categories"
        clickable
        onClick={showSidenav}
        sx={{
          margin: "5px",
          marginBottom: "5px",
          backgroundColor: "transparent",
        }}
        variant="filled"
      />
      {/* <Chip icon={<FaceIcon />} label="With Icon" variant="outlined" /> */}
      <nav
        className={sidenav ? "navbar-side-items toggled" : "navbar-side-items"}
      >
        <ul className="categories">
          {categories.map((category) => {
            return (
              <li className="nav-menu-side" key={category.categoryId}>
                <Nav.Item
                  className="nav-links-side"
                  id={
                    activeCategoryState.activeCategory === category.categoryName
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    handleUpdateActiveCategory(category.categoryName)
                  }
                >
                  <img
                    src={images[`${formatString(category.categoryName)}.png`]}
                    alt={formatString(category.categoryName)}
                  />
                  {category.categoryName}
                </Nav.Item>
              </li>
            );
          })}
          {/* </Stack> */}
        </ul>

        {/* </Container> */}
      </nav>
    </Navbar>
  );
}

export default SideNav;
