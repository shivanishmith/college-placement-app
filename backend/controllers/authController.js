// Register user
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) return res.status(400).json({ message: "Please provide name, email, and password" });

    const emailRegex = /.+@.+\..+/;
    if (!emailRegex.test(email)) return res.status(400).json({ message: "Please provide a valid email address" });

    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters long" });

    if (!['student', 'teacher', 'superadmin'].includes(role)) return res.status(400).json({ message: "Invalid role" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User with this email already exists" });

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.status(201).json({
      success: true,
      message: "User registered",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login user (modified for Redux)
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Please provide both email and password" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No user found" });

    if (role && user.role !== role) return res.status(403).json({ message: "Invalid role for this user" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update user profile (Redux structure)
exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (req.files) {
      if (req.files.image) {
        const image = await cloudinary.uploader.upload(req.files.image[0].path);
        updateData.image = image.secure_url;
      }
      if (req.files.resume) {
        const resume = await cloudinary.uploader.upload(req.files.resume[0].path);
        updateData.resume = resume.secure_url;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
    res.json({
      success: true,
      message: "Profile updated",
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
};
